import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "@capacitor/splash-screen";
import { CameraSource, Camera, CameraResultType } from "@capacitor/camera";
import graphqlClient from "./graphqlClient";
import { useSession } from "./SessionContext";
import { Modal, AlertModal } from "./Modal";
import ImageGallery from "./ImageGallery";
import { AgGridReact } from "ag-grid-react";
import { GridApi } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFolderOpen,
  FaCamera,
} from "react-icons/fa";

interface FooterProps {
  onNewTag: () => void;
  onEditTag: () => void;
  onDeleteTag: () => void;
}
interface TitlebarProps {
  showAlert: (message: string) => Promise<void>;
}

const Main = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDefaultValue, setModalDefaultValue] = useState("");
  const [resolvePromise, setResolvePromise] = useState<
    ((value: string | null) => void) | null
  >(null);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [resolveAlertPromise, setResolveAlertPromise] = useState<
    (() => void) | null
  >(null);
  const [buttons, setButtons] = useState([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const { username } = useSession();
  useEffect(() => {
    SplashScreen.hide();
    fetchButtons();
  }, []);

  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowData, setRowData] = useState([]);

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryOpen, setGalleryOpen] = useState(false);

  const onGridReady = useCallback(
    (params: { api: React.SetStateAction<null> }) => {
      setGridApi(params.api);
    },
    []
  );

  const getSelectedRowData = () => {
    if (gridApi?.getSelectedRows) {
      let selectedData = gridApi.getSelectedRows();
      return selectedData;
    } else {
      return null;
    }
  };

  const fetchButtons = async () => {
    try {
      const result = await graphqlClient(`
        query {
          photo(params: { type: "tag", user: "${username}" })
        }
      `);
      setButtons(result.photo.tags || []);
    } catch (error) {
      console.error("Failed to load buttons:", error);
    }
  };

  const openModal = (
    title: React.SetStateAction<string>,
    defaultValue: React.SetStateAction<string>
  ) => {
    return new Promise((resolve) => {
      setModalTitle(title);
      setModalDefaultValue(defaultValue);
      setModalOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const showAlert = (message: string) => {
    return new Promise<void>((resolve) => {
      setAlertMessage(message);
      setAlertOpen(true);
      setResolveAlertPromise(() => resolve);
    });
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  const handleNewTag = async () => {
    try {
      const newTag = await openModal("Podaj nazwę nowego taga:", "");
      if (newTag) {
        await graphqlClient(`
          query {
            photo(params: { type: "tag_create", user: "${username}", tag: "${newTag}" })
          }
        `);
        await fetchButtons();
      }
    } catch (error) {
      console.error("Failed to add new tag:", error);
    }
  };

  const handleEditTag = async () => {
    let thisSelectedTag = getSelectedRowData();
    thisSelectedTag = thisSelectedTag?.[0]?.tag;
    if (!thisSelectedTag) {
      await showAlert("Wybierz tag do edycji.");
      return;
    }
    const newTag = await openModal(
      "Podaj nową nazwę taga:",
      String(thisSelectedTag)
    );
    if (newTag && newTag !== thisSelectedTag) {
      try {
        await graphqlClient(`
            query {
            photo(params: { type: "tag_update", user: "${username}", prevtag: "${thisSelectedTag}", tag: "${newTag}" })
            }
            `);
        fetchButtons();
      } catch (error) {
        console.error("Failed to update tag:", error);
      }
    }
  };

  const handleDeleteTag = async () => {
    let thisSelectedTag = getSelectedRowData();
    thisSelectedTag = thisSelectedTag?.[0]?.tag;
    if (!thisSelectedTag) {
      await showAlert("Wybierz tag do edycji.");
      return;
    }
    try {
      if (confirm(`Usunąć ${thisSelectedTag}, czy jesteś pewien?`)) {
        await graphqlClient(`
            query {
            photo(params: { type: "tag_delete", user: "${username}", tag: "${thisSelectedTag}" })
            }
            `);
        fetchButtons();
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  const rowSelection = {
    mode: "singleRow",
  };

  const takePhoto = async (tag: string) => {
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
        //allowEditing: true,
        //webUseInput:
        //promptLabelPhoto
        quality: 90,
      });

      if (imageRef.current) {
        imageRef.current.src = `data:image/jpeg;base64,${photo.base64String}`;
      }
      const result = await graphqlClient(
        `
            query {
              photo(params: { type: "upload", filename: "photo.jpg", content: "${photo.base64String}", user: "${username}", tag: "${tag}" })
            }
          `
      );
      fetchButtons();
    } catch (e) {
      if (String(e).indexOf("User cancelled photos app") >= 0) {
        // nie pokazuj zbednego komunikatu
      } else {
        await showAlert("User cancelled" + e);
      }
    }
  };

  // Funkcja przeglądania zdjęć
  const browse = async (tag: string) => {
    try {
      const result = await graphqlClient(`
        query {
          photo(params: { type: "browse", user: "${username}", tag: "${tag}" })
        }
      `);
      setGalleryImages(result.photo.images || []);
      setGalleryOpen(true);
    } catch (error) {
      await showAlert("Błąd podczas przeglądania zdjęć.");
      console.error(error);
    }
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    setGalleryImages([]);
  };

  const onSelectionChanged = (event: {
    api: { getSelectedRows: () => any };
  }) => {
    const selectedRows = event.api.getSelectedRows();
    const newSelectedTag = selectedRows.length ? selectedRows[0].tag : null;
    if (selectedTag) {
      setSelectedTag(selectedTag);
    }
  };

  const columnDefs = [
    {
      headerName: "Tag",
      field: "tag",
      sortable: false,
      filter: false,
      flex: true,
      cellStyle: { paddingLeft: 0, paddingRight: 0 },
      cellRenderer: (params: any) => (
        <button
          className="flex items-center w-full p-2 text-white bg-green-500 rounded hover:bg-blue-700"
          onClick={() => takePhoto(params.value)}
        >
          <FaCamera className="text-3xl mr-1" /> {/* margin right*/}
          {params.value}
        </button>
      ),
    },

    {
      headerName: "Browse",
      field: "count",
      sortable: false,
      filter: false,
      flex: false,
      width: 100,
      cellStyle: { paddingLeft: 0, paddingRight: 0 },
      cellRenderer: (params: any) => (
        <button
          className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700"
          onClick={() => {
            browse(params.data.tag);
          }}
        >
          <FaFolderOpen className="text-3xl mr-1" /> {/* Duża ikona */}
          {params.data.count}
        </button>
      ),
    },
  ];

  return (
    <div className="font-sans block w-full h-full flex flex-col">
      <Titlebar showAlert={showAlert} />
      <main className="flex-grow">
        <div
          className="ag-theme-alpine h-full w-full"
          style={{ height: "calc(100vh - 148px)" }} // 100vh minus wysokość paska
        >
          <AgGridReact
            rowData={buttons}
            columnDefs={columnDefs}
            headerHeight={0} // Ukrywa nagłówki
            rowHeight={60}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            rowSelection={rowSelection}
          />
        </div>
        <p>
          <img ref={imageRef} className="max-w-full" />
        </p>
      </main>
      <Footer
        onNewTag={handleNewTag}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        defaultValue={modalDefaultValue}
        resolve={resolvePromise}
      />
      <AlertModal
        isOpen={isAlertOpen}
        message={alertMessage}
        onClose={closeAlert}
        resolve={resolveAlertPromise!} // Non-null assertion as resolve will always be set before open
      />

      {/* Inne elementy */}
      {isGalleryOpen && (
        <ImageGallery images={galleryImages} onClose={closeGallery} />
      )}
    </div>
  );
};

const Titlebar: React.FC<TitlebarProps> = ({ showAlert }) => {
  const { isLoggedIn, username, logout } = useSession();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      await graphqlClient(
        `
        query {
          auth(params: { type: "session", sessionId: "${sessionId}" })
        }
      `
      );
      logout();
      navigate("/login");
    } catch (e) {
      await showAlert(String(e));
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <div className="relative flex justify-between p-4 bg-blue-600">
      <h1 className="m-0 text-sm font-semibold text-white">photoTag v0.10</h1>
      <div className="flex items-center space-x-2">
        <span className="text-white text-sm">{username}</span>
        <button className="text-white" onClick={toggleDropdown}>
          ☰
        </button>
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 bg-black opacity-25"
              onClick={closeDropdown}
            />
            <div
              className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg w-48"
              style={{ top: "calc(100% - 2px)", zIndex: 50 }}
            >
              <button
                className="absolute top-1 left-1 text-gray-500 hover:text-gray-700"
                onClick={closeDropdown}
              >
                ✕
              </button>
              <button
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                onClick={handleLogout}
              >
                Wyloguj
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({
  onNewTag,
  onEditTag,
  onDeleteTag,
}) => (
  <div className="fixed bottom-0 flex justify-around w-full p-4 bg-blue-600 shadow-lg">
    <button
      className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 shadow-md transition-all duration-200"
      onClick={onNewTag}
    >
      <FaPlus className="mr-2" />
      Nowy
    </button>

    <button
      className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 shadow-md transition-all duration-200"
      onClick={onEditTag}
    >
      <FaEdit className="mr-2" />
      Popraw
    </button>

    <button
      className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 shadow-md transition-all duration-200"
      onClick={onDeleteTag}
    >
      <FaTrash className="mr-2" />
      Usuń
    </button>
  </div>
);

export default Main;
