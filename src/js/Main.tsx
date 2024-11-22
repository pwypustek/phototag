import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "@capacitor/splash-screen";
import { CameraSource, Camera, CameraResultType } from "@capacitor/camera";
import { graphqlClient, config } from "./graphqlClient";
import { useSession } from "./SessionContext";
import { useModal } from "./Modal";
import { Grid, GridRef } from "./Grid";
import Form from "./Form";
import { FaPlus, FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import { fetchData, parseTagFolderName } from "./Data";

interface FooterProps {
  onCreateTag: () => void;
  onUpdateTag: () => void;
  onDeleteTag: () => void;
}
const Main = (addTab: any) => {
  const { ModalComponent, openModal } = useModal();
  //const imageRef = useRef<HTMLImageElement | null>(null);
  const { username, sessionId, cwid } = useSession();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [formObjectId, setFormObjectId] = useState<string>("");
  const [formObjectArgs, setFormObjectArgs] = useState<any>({});

  //  const [gridRefresh, setGridRefresh] = useState<any>(null);

  const [isFormOpen, setFormOpen] = useState(false);

  // from Title
  const { isLoggedIn, logout } = useSession();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  const gridRef = useRef<GridRef>(null);

  const handleGridRefresh = () => {
    if (gridRef.current) {
      gridRef.current.Refresh();
    }
  };

  const takePhoto = async (tag: string) => {
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        saveToGallery: true,
        //Aby uzyskać dostęp do nazwy pliku wygenerowanej przez system,
        //użyj resultType: "uri". Zwróci ona ścieżkę do pliku w systemie,
        //którą możesz wykorzystać do odczytania nazwy pliku.
        resultType: CameraResultType.Uri, //"uri",
        //resultType: CameraResultType.Base64,
        quality: 100, //90,
      });

      // Przykład użycia:
      const path = String(photo.path || photo.webPath);
      const photoFileName = path.substring(path.lastIndexOf("/") + 1);

      // const getFileNameFromPath = (path) => {
      //   return path.substring(path.lastIndexOf('/') + 1);
      // };

      // // Przykład użycia:
      // const fileName = getFileNameFromPath(photo.path || photo.webPath);
      // console.log('Nazwa zdjęcia:', fileName);

      // if (imageRef.current) {
      //   imageRef.current.src = `data:image/jpeg;base64,${photo.base64String}`;
      // }

      if (photo.path || photo.webPath) {
        // Odczytaj plik jako Base64
        const base64Data = await convertFileToBase64(String(photo.path || photo.webPath));

        await graphqlClient(`photo`, {
          type: "upload",
          filename: photoFileName,
          content: base64Data,
          user: username,
          tag: tag,
        });
      } else {
        alert("Error photo path");
      }
      handleGridRefresh();
    } catch (e) {
      //alert(`Error taking photo: ${String(e)}`);
      if (String(e).indexOf("User cancelled photos app") >= 0) {
        // nie pokazuj zbednego komunikatu
      } else {
        await openModal("User cancelled", { type: "alert" });
      }
    }
  };

  const browse = async (tag: string) => {
    try {
      console.log("Browsing, setting formObjectId and formImages."); // <- Render na zmianę `formObjectId` i `formImages`
      setFormObjectId("imageGallery");
      setFormObjectArgs({ tag: tag });
      //setFormObjectArgs({ images: result.photo.images });
      setFormOpen(true);
    } catch (error) {
      alert("Error browsing photos:" + JSON.stringify(error));
    }
  };

  const handleDownloadSelected = (selectedImages: any) => {
    //selectedImages.forEach((imageUrl, index) => {
    // const link = document.createElement("a");
    // link.href = `data:image/jpeg;base64,${selectedImages.imageUrl}`;
    // link.download = `downloaded-image-${selectedImages.name}.jpg`; //link.download = `downloaded-image-${index + 1}.jpg`;
    // link.click();
    //});
  };

  const closeForm = () => {
    console.log("Closing form.");
    setFormOpen(false);
  };

  const handleCreateTag = async () => {
    try {
      const ret: any = await openModal("Podaj nazwę nowego taga:", {
        type: "promptWithTagType",
        defaultValue: "",
      });
      if (ret?.value) {
        let tagName = ret.selectedTagType == "Brak kategorii" ? `${ret.value}` : `[${ret.selectedTagType}] ${ret.value}`;
        tagName = await graphqlClient(`photo`, {
          type: "tag_create",
          user: username,
          tag: tagName,
        });
        handleGridRefresh();
      }
    } catch (error) {
      alert(`Failed to add new tag: ${JSON.stringify(error)}`);
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
    if ((ret?.value && ret?.value !== tagName) || (ret?.selectedTagType && ret?.selectedTagType !== tagType)) {
      try {
        let tagNameNew = ret.selectedTagType == "Brak kategorii" ? `${ret.value}` : `[${ret.selectedTagType}] ${ret.value}`;

        await graphqlClient(`photo`, {
          type: "tag_update",
          user: username,
          prevtag: selectedTag,
          tag: tagNameNew,
        });
        handleGridRefresh();
      } catch (error) {
        alert(`Failed to update tag: ${JSON.stringify(error)}`);
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
      const ret: any = await openModal(`Usunąć ${selectedTag}, czy jesteś pewien?`, {
        type: "confirm",
        message: "Czy na pewno chcesz usunąć?",
      });
      if (ret?.value === "confirmed") {
        await graphqlClient(`photo`, {
          type: "tag_delete",
          user: username,
          tag: selectedTag,
        });
        handleGridRefresh();
      }
    } catch (error) {
      alert(`Failed to delete tag: ${JSON.stringify(error)}`);
    }
  };

  const toggleDropdown = () => {
    console.log("Toggling dropdown:", !isDropdownOpen);
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      await graphqlClient(`auth`, {
        type: "logout",
        sessionId: sessionId,
        cwid: cwid,
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
        //setFormObjectArgs({ images: result.photo.images });
        //setFormImages(/*result.photo.images ||*/ []);
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

  const renders = useRef(0);
  renders.current += 1;
  console.log(`main render count: ${renders.current} isLoggedIn: ${isLoggedIn}`);

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
              <div className="fixed inset-0 bg-black opacity-25" onClick={closeDropdown} />
              <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg w-48" style={{ top: "calc(100% - 2px)", zIndex: 50 }}>
                <button className="absolute top-1 left-1 text-gray-500 hover:text-gray-700 text-2xl" onClick={closeDropdown}>
                  ✕
                </button>

                {config.withTabs && (
                  <>
                    <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full" onClick={handleOpenForm}>
                      Nowa zakładka
                    </button>
                    <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full" onClick={handleSettings}>
                      Ustawienia
                    </button>
                  </>
                )}
                <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full" onClick={handleLogout}>
                  Wyloguj
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <main className="flex-grow">
        <Grid objectId={"taggrid"} objectArgs={{}} ref={gridRef} onSelectionChanged={(selectedRow) => setSelectedTag(selectedRow ? selectedRow.tag : null)} takePhoto={takePhoto} browse={browse} gridParam={{ multiSelect: false }} />
        {/*<p>
          <img ref={imageRef} className="max-w-full" />
        </p>*/}
      </main>
      <Footer onCreateTag={handleCreateTag} onUpdateTag={handleUpdateTag} onDeleteTag={handleDeleteTag} />

      {ModalComponent}

      {isFormOpen && (
        <Form
          //objectId="settings"
          objectId={formObjectId}
          objectArgs={formObjectArgs}
          isOpen={isFormOpen}
          tagName={selectedTag}
          onClose={closeForm}
          onDownload={handleDownloadSelected}
        />
      )}
    </div>
  );
};

const Footer: React.FC<FooterProps> = ({ onCreateTag, onUpdateTag, onDeleteTag }) => (
  <div className="fixed bottom-0 flex justify-around w-full p-4 bg-blue-600 shadow-lg">
    <button className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 shadow-md transition-all duration-200" onClick={onCreateTag}>
      <FaPlus className="mr-2" />
      Nowy
    </button>

    <button className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 shadow-md transition-all duration-200" onClick={onUpdateTag}>
      <FaEdit className="mr-2" />
      Popraw
    </button>

    <button className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 shadow-md transition-all duration-200" onClick={onDeleteTag}>
      <FaTrash className="mr-2" />
      Usuń
    </button>
  </div>
);

const convertFileToBase64 = async (filePath: string) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        //resolve(reader?.result?.split(",")[1]); // Usuwamy nagłówek data:image/jpeg;base64,
        if (typeof reader.result === "string") {
          resolve(reader.result.split(",")[1]); // Usuwamy nagłówek data:image/jpeg;base64,
        } else {
          reject(new Error("Result is not a string"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open("GET", filePath);
    xhr.responseType = "blob";
    xhr.send();
  });
};

export default Main;
