import React, { useState } from "react";
import { Grid } from "./Grid";
import { graphqlClient, config } from "./graphqlClient";
import { useSession, useSessionOutsideReact } from "./SessionContext";

import { Button } from "@/components/ui/button";

interface FormProps {
  objectId: string;
  objectArgs: any;
  isOpen: boolean;
  tagName: string | null;
  onClose: () => void;
  onDownload: (selectedImages: string[]) => void;
}

const Form: React.FC<FormProps> = ({ objectId, objectArgs, isOpen, tagName, onClose, onDownload }) => {
  if (!isOpen /* || !tagName*/) return null;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCellClick = async (imageUrl: string) => {
    try {
      const session = useSessionOutsideReact();
      const result = await graphqlClient(`photo`, {
        type: "fullImage",
        user: session.username,
        tag: tagName,
        name: imageUrl,
      });
      //setFormImages(result.photo.images || []);

      setSelectedImage(`data:image/jpeg;base64,${result.photo.fullImage}`); //
      //setSelectedImage(`data:image/jpeg;base64,${result.fullImage.base64}`); //result.photo.images
    } catch (error) {
      alert(`Failed to fetch full image: ${JSON.stringify(error)}`);
    }
  };

  //if (!isOpen /*|| !tagName*/) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full view" className="max-w-full max-h-full" />
        </div>
      )}
      <div className="relative p-4 bg-white rounded shadow-lg max-w-2xl w-full ag-theme-alpine">
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

        <div className="flex justify-around mt-4">
          <div>
            <Button>Click me</Button>
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
