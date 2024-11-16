import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "@capacitor/splash-screen";
import { CameraSource, Camera, CameraResultType } from "@capacitor/camera";
import { graphqlClient, config } from "./graphqlClient";
import { useSession } from "./SessionContext";
import { useModal } from "./Modal";
import Grid from "./Grid";
import Form from "./Form";
import { FaPlus, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { fetchTags, parseTagFolderName } from "./Data";

interface FooterProps {
  onCreateTag: () => void;
  onUpdateTag: () => void;
  onDeleteTag: () => void;
}
const Main = (addTab: any) => {
  const { ModalComponent, openModal } = useModal();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { username } = useSession();
  const [rowDataTag, setRowDataTag] = useState([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formObjectId, setFormObjectId] = useState<string>("");
  const [isFormOpen, setFormOpen] = useState(false);

  useEffect(() => {
    SplashScreen.hide();
    fetchTags("", username, setRowDataTag);
  }, []);

  const takePhoto = async (tag: string) => {
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Base64,
        quality: 90,
      });

      if (imageRef.current) {
        imageRef.current.src = `data:image/jpeg;base64,${photo.base64String}`;
      }
      await graphqlClient(`photo`, {
        type: "upload",
        filename: "photo.jpg",
        content: photo.base64String,
        user: username,
        tag: tag,
      });
      fetchTags("", username, setRowDataTag);
    } catch (e) {
      console.error("Error taking photo:", e);
    }
  };

  const browse = async (tag: string) => {
    try {
      const result = await graphqlClient(`photo`, {
        type: "browse",
        user: username,
        tag: tag,
      });
      setFormObjectId("imageGallery");
      setFormImages(result.photo.images || []);
      setFormOpen(true);
    } catch (error) {
      console.error("Error browsing photos:", error);
    }
  };

  const handleDownloadSelected = (selectedImages: string[]) => {
    debugger;
    selectedImages.forEach((imageUrl, index) => {
      const link = document.createElement("a");
      link.href = `data:image/jpeg;base64,${imageUrl}`;
      link.download = `downloaded-image-${index + 1}.jpg`;
      link.click();
    });
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormImages([]);
  };

  const handleCreateTag = async () => {
    try {
      const ret: any = await openModal("Podaj nazwę nowego taga:", {
        type: "promptWithTagType",
        defaultValue: "",
      });
      if (ret?.value) {
        let tagName =
          ret.selectedTagType == "Brak kategorii"
            ? `${ret.value}`
            : `[${ret.selectedTagType}] ${ret.value}`;
        tagName = await graphqlClient(`photo`, {
          type: "tag_create",
          user: username,
          tag: tagName,
        });
        await fetchTags("", username, setRowDataTag);
      }
    } catch (error) {
      console.error("Failed to add new tag:", error);
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) {
      openModal("Wybierz tag do edycji.", { type: "alert" });
      return;
    }
    const { tagType, tagName } = parseTagFolderName(selectedTag) || {
      tagType: "",
      tagName: "",
    };
    const ret: any = await openModal("Podaj nową nazwę taga:", {
      type: "promptWithTagType",
      defaultValue: tagName,
      defaultTagType: tagType,
    });
    if (
      (ret?.value && ret?.value !== tagName) ||
      (ret?.selectedTagType && ret?.selectedTagType !== tagType)
    ) {
      try {
        let tagNameNew =
          ret.selectedTagType == "Brak kategorii"
            ? `${ret.value}`
            : `[${ret.selectedTagType}] ${ret.value}`;

        await graphqlClient(`photo`, {
          type: "tag_update",
          user: username,
          prevtag: selectedTag,
          tag: tagNameNew,
        });
        fetchTags("", username, setRowDataTag);
      } catch (error) {
        console.error("Failed to update tag:", error);
      }
    } else {
      openModal(`Nie wprowadzono zmian ${selectedTag} ${tagType} ${tagName}`, {
        type: "alert",
      });
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) {
      openModal("Wybierz tag do usunięcia.", { type: "alert" });
      return;
    }
    try {
      const ret: any = await openModal(
        `Usunąć ${selectedTag}, czy jesteś pewien?`,
        {
          type: "confirm",
          message: "Czy na pewno chcesz usunąć?",
        }
      );
      if (ret?.value === "confirmed") {
        await graphqlClient(`photo`, {
          type: "tag_delete",
          user: username,
          tag: selectedTag,
        });
        fetchTags("", username, setRowDataTag);
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
    }
  };

  // from Title
  const { isLoggedIn, logout } = useSession();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      await graphqlClient(`auth`, {
        type: "session",
        sessionId: sessionId,
      });
      logout();
      navigate("/login");
    } catch (e) {
      openModal(String(e), { type: "alert" });
    }
  };

  const handleSettings = async () => {
    try {
      // const sessionId = localStorage.getItem("sessionId");
      // await graphqlClient(
      //   `
      //   query {
      //     auth(params: { type: "session", sessionId: sessionId })
      //   }
      // `
      // );
      // logout();
      // navigate("/login");

      try {
        // const result = await graphqlClient(`
        //   query {
        //     auth(params: { type: "settings", user: username })
        //   }
        // `);
        setFormObjectId("settings");
        setFormImages(/*result.photo.images ||*/ []);
        setFormOpen(true);
      } catch (error) {
        console.error("Error browsing photos:", error);
      }
    } catch (e) {
      openModal(String(e), { type: "alert" });
    }
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const handleOpenForm = () => {
    console.log(addTab);
    if (addTab?.addTab) {
      addTab(`Tab ${Math.random()}`, <Main addTab={addTab} />);
    } else {
      alert("Błąd 987342987");
    }
  };

  return (
    <div className="font-sans block w-full h-full flex flex-col">
      <div className="relative flex justify-between p-4 bg-blue-600">
        <h1 className="m-0 text-sm font-semibold text-white">photoTag v0.12</h1>
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
                  className="absolute top-1 left-1 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={closeDropdown}
                >
                  ✕
                </button>

                {config.withTabs && (
                  <>
                    <button
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                      onClick={handleOpenForm}
                    >
                      Nowa zakładka
                    </button>
                    <button
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
                      onClick={handleSettings}
                    >
                      Ustawienia
                    </button>
                  </>
                )}

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

      <main className="flex-grow">
        <Grid
          objectId={"taggrid"}
          rowData={rowDataTag}
          onSelectionChanged={(selectedRow) =>
            setSelectedTag(selectedRow ? selectedRow.tag : null)
          }
          takePhoto={takePhoto}
          browse={browse}
          gridParam={{ multiSelect: false }}
        />
        <p>
          <img ref={imageRef} className="max-w-full" />
        </p>
      </main>
      <Footer
        onCreateTag={handleCreateTag}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
      />

      {ModalComponent}

      <Form
        //objectId="settings"
        objectId={formObjectId}
        images={formImages}
        isOpen={isFormOpen}
        onClose={closeForm}
        onDownload={handleDownloadSelected}
      />
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
}) => (
  <div className="fixed bottom-0 flex justify-around w-full p-4 bg-blue-600 shadow-lg">
    <button
      className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 shadow-md transition-all duration-200"
      onClick={onCreateTag}
    >
      <FaPlus className="mr-2" />
      Nowy
    </button>

    <button
      className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 shadow-md transition-all duration-200"
      onClick={onUpdateTag}
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
