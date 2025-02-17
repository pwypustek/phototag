import React, { useState } from "react";
import { Grid } from "./Grid";
import { graphqlClient, config, LoadingIndicator } from "./graphqlClient";
import { useSession, useSessionOutsideReact } from "./SessionContext";
import { Button } from "@/components/ui/button";
import { useModal } from "./Modal";

interface FormProps {
  objectId: string;
  objectArgs: any;
  isOpen: boolean;
  //tagName: string | null;
  onClose: () => void;
  onDownload: (selectedImages: string[]) => void;
}

const Form: React.FC<FormProps> = ({ objectId, objectArgs, isOpen, /*tagName,*/ onClose, onDownload }) => {
  if (!isOpen /* || !tagName*/) return null;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const { ModalComponent, openModal } = useModal();

  const handleCellClick = async (imageUrl: string) => {
    try {
      setUploadProgress(0);
      const session = useSessionOutsideReact();
      const result = await graphqlClient(`photo`, {
        type: "fullImage",
        user: session.username,
        tag: objectArgs.tag,
        name: imageUrl,
      });
      //setFormImages(result.photo.images || []);
      setUploadProgress(null);
      if (result.photo.type == "text") {
        const decodedText = decodeURIComponent(escape(atob(result.photo.fullText)));
        //await openModal(decodedText, { type: "monaco" });

        /*const { value: text }: any = */ await openModal("Notatka:", {
          type: "monaco", //prompt
          readonly: true,
          defaultValue: decodedText,
        });
        // if (text !== decodedText) {
        //   alert("Zmieniona zawartość niestety nie jest jeszcze zapisywana: " + text);
        // }
      } else {
        setSelectedImage(`data:image/jpeg;base64,${result.photo.fullImage}`); //
      }
      //setSelectedImage(`data:image/jpeg;base64,${result.fullImage.base64}`); //result.photo.images
    } catch (error) {
      setUploadProgress(null);
      alert(`Failed to fetch full image: ${JSON.stringify(error)}`);
    }
  };

  //if (!isOpen /*|| !tagName*/) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75        overflow-auto ">
      {/* max-w-full max-h-full */}
      {/* w-full  */}
      {/* flex items-center justify-center  */}
      <LoadingIndicator progress={uploadProgress} />
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full view" className="max-w-full max-h-full" />
        </div>
      )}

      <div className="relative p-4 bg-white rounded shadow-lg w-full ag-theme-alpine">
        {/* max-w-2xl  */}
        {/* <div className="fixed inset-0 bg-white z-50 overflow-auto ag-theme-alpine"> */}
        <button className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-2xl" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Image Form</h2>

        <Grid
          objectId={objectId}
          objectArgs={objectArgs}
          gridParam={{ multiSelect: true }}
          onSelectionChanged={
            (selectedRows) => onDownload(selectedRows)
            //onDownload(selectedRows.map((row: any) => row.imageUrl))
          }
          onCellClicked={(image: string) => handleCellClick(image)}
        />

        {ModalComponent}

        <div className="flex justify-around mt-4">
          <div>
            <Button onClick={onClose}>Zamknij</Button>
          </div>

          {/* <button
            className="flex items-center w-3/10 p-3 my-1 text-lg font-semibold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 shadow-md transition-all duration-200"
            onClick={() => onDownload(images)}
          >
            <FaDownload className="mr-2" />
            Pobierz
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default Form;
