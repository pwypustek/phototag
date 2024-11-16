import React, { useEffect, useState } from "react";
import Grid from "./Grid";
import { FaDownload } from "react-icons/fa";
import { formFetchData } from "./Data";

interface FormProps {
  objectId: string;
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  onDownload: (selectedImages: string[]) => void;
}

const Form: React.FC<FormProps> = ({
  objectId,
  images,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen) return null;

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    formFetchData(objectId, images, setRowData);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative p-4 bg-white rounded shadow-lg max-w-2xl w-full ag-theme-alpine">
        <button
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">Image Form</h2>

        <Grid
          objectId={objectId}
          rowData={rowData}
          gridParam={{ multiSelect: true }}
          onSelectionChanged={
            (selectedRows) => onDownload(selectedRows)
            //onDownload(selectedRows.map((row: any) => row.imageUrl))
          }
        />

        <div className="flex justify-around mt-4">
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
