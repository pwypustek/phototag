// Grid.tsx
import React, { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaDownload } from "react-icons/fa";
import { RowSelectionOptions } from "@ag-grid-community/core";
import { FaCamera, FaFolderOpen } from "react-icons/fa";

interface GridProps {
  objectId: string;
  rowData: any[];
  onSelectionChanged?: (selectedRow: any) => void;
  gridParam?: Record<string, any>;
  takePhoto?: (tag: string) => void;
  browse?: (tag: string) => void;
  onClose?: () => void;
}

const Grid: React.FC<GridProps> = ({
  objectId,
  rowData,
  onSelectionChanged,
  gridParam = {},
  takePhoto,
  browse,
  onClose,
}) => {
  const rowHeight = 60;
  let headerHeight;
  if (gridParam.header) {
    headerHeight = 50;
  } else {
    headerHeight = 0;
  }

  const columnDefs = useMemo(() => {
    switch (objectId) {
      case "taggrid":
        return [
          {
            headerName: "Tag",
            field: "tag",
            flex: true,
            cellStyle: { paddingLeft: 0, paddingRight: 0 },
            cellRenderer: (params: any) => (
              <button
                className="flex items-center w-full p-2 text-white bg-green-500 rounded hover:bg-blue-700"
                onClick={() => takePhoto?.(params.data.tag)}
              >
                <FaCamera className="text-3xl mr-1" />
                {params.data.tag}
              </button>
            ),
          },
          {
            headerName: "Browse",
            field: "count",
            width: 100,
            cellStyle: { paddingLeft: 0, paddingRight: 0 },
            cellRenderer: (params: any) => (
              <button
                className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700"
                onClick={() => browse?.(params.data.tag)}
              >
                <FaFolderOpen className="text-3xl mr-1" />
                {params.data.count}
              </button>
            ),
          },
        ];
      case "imageGallery":
        return [
          {
            headerName: "Image",
            field: "imageUrl",
            width: 100,
            cellStyle: { paddingLeft: 0, paddingRight: 0 },
            cellRenderer: (params: any) => (
              <img
                src={params.value}
                style={{
                  /*width: "100%", */ height: "100%" /*maxHeight: "150px"*/,
                }}
                alt="Gallery"
              />
            ),
          },
          {
            headerName: "Download",
            field: "download",
            width: 100,
            cellStyle: { paddingLeft: 0, paddingRight: 0 },
            cellRenderer: (params: any) => {
              const downloadImage = () => {
                const link = document.createElement("a");
                link.href = params.data.imageUrl;
                link.download = `image-${params.data.id}.jpg`;
                link.click();
              };
              return (
                <button
                  className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700"
                  onClick={downloadImage}
                >
                  <FaDownload className="text-2xl" />
                </button>
              );
            },
          },

          // {
          //   cellRenderer: (params: any) => (
          //     <button onClick={() => downloadImage(params.value)}>
          //       <FaDownload />
          //     </button>
          //   ),
          // },
        ];

      case "settings":
        return [
          {
            headerName: "Param",
            field: "param",
            width: 200,
            cellStyle: { paddingLeft: 0, paddingRight: 0 },
            cellRenderer: (params: any) => <div>{params.value}</div>,
          },
          {
            headerName: "Value",
            field: "value",
            width: 200,
            cellStyle: { paddingLeft: 0, paddingRight: 0 },
            cellRenderer: (params: any) => <div>{params.value}</div>,
          },

          // {
          //   cellRenderer: (params: any) => (
          //     <button onClick={() => downloadImage(params.value)}>
          //       <FaDownload />
          //     </button>
          //   ),
          // },
        ];

      default:
        return [];
    }
  }, [objectId, takePhoto, browse]);

  const rowSelection = useMemo<
    RowSelectionOptions | "single" | "multiple"
  >(() => {
    if (gridParam.multiSelect == true) {
      return {
        mode: "multiRow",
        checkboxes: true,
        enableClickSelection: true,
      };
    } else {
      return {
        mode: "singleRow",
        checkboxes: true,
        enableClickSelection: true,
      };
    }
  }, []);

  // const downloadImage = (url: string) => {
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = "downloaded-image.jpg";
  //   link.click();
  // };

  return (
    //<div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
    <div
      className="ag-theme-alpine h-full w-full"
      style={{ height: "calc(100vh - 148px)" }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs as never}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        rowSelection={rowSelection as never}
        onSelectionChanged={(event) => {
          console.log(
            `onSelectionChanged?.(event.api.getSelectedRows()[0] || null); ${
              event.api.getSelectedRows()[0]
            }`
          );
          onSelectionChanged?.(event.api.getSelectedRows()[0] || null);
        }}
      />
    </div>
  );
};

export default Grid;
