import { graphqlClient } from "./graphqlClient";
import type { CustomCellRendererProps } from "@ag-grid-community/react";
import { type FunctionComponent } from "react";
import { FaCamera, FaFolderOpen, FaDownload } from "react-icons/fa";

const fetchColumnDefs = async (objectId: string) => {
  try {
    const result = await graphqlClient(`photo`, {
      type: "fetchColumnDefs",
      objectId: objectId,
    });

    switch (objectId) {
      case "taggrid":
        result.photo[0].cellRenderer = (params: any) => (
          <button
            className="flex items-center w-full p-2 text-white bg-green-500 rounded hover:bg-blue-700"
            onClick={() => {
              // chat gpt podał return params.context.takePhoto?.(params.data.tag);
              return params.colDef.context.takePhoto?.(params.data.tag);
            }}
          >
            <FaCamera className="text-3xl mr-1" />
            {params.data.tag}
          </button>
        );

        result.photo[1].cellRenderer = (params: any) => (
          <button
            className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700"
            onClick={() => {
              return params.colDef.context.browse?.(params.data.tag);
            }}
          >
            <FaFolderOpen className="text-3xl mr-1" />
            {params.data.count}
          </button>
        );
        break;

      case "imageGallery":
        result.photo[0].cellRenderer = (params: any) => {
          const image = `data:image/jpeg;base64,${params.data.base64String}`;
          return <img src={image} alt="Gallery" className="cursor-pointer" onClick={() => params.colDef.context.onCellClicked?.(params.data.name)} />;
        };

        /*params.value  return params.data.base64String;*/
        result.photo[1].cellRenderer = (params: any) => {
          const downloadImage = () => {
            const link = document.createElement("a");
            link.href = params.data.imageUrl;
            link.download = `image-${params.data.name}.jpg`;
            link.click();
          };
          return (
            <button className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700" onClick={downloadImage}>
              <FaDownload className="text-2xl" />
            </button>
          );
        };
        break;

      default:
      //alert(`Error #098098243`);
    }
    return result.photo;
  } catch (error) {
    alert("Failed to load tags:" + JSON.stringify(error));
  }
};

const fetchData = async (objectId: string, objectArgs: any, username: string | null, setRowData: React.Dispatch<React.SetStateAction<never[]>>) => {
  try {
    switch (objectId) {
      case "taggrid":
        {
          const result = await graphqlClient(`photo`, {
            type: "tag",
            user: username,
          });
          setRowData(result.photo.tags || []);
        }
        break;

      case "imageGallery":
        {
          const result = await graphqlClient(`photo`, {
            type: "browse",
            user: username,
            tag: objectArgs.tag,
          });
          let poprawPowyżejTagNaSztywnoJest;
          setRowData(result.photo.images || []);
          //setFormImages(result.photo.images || []);
        }
        break;

      case "settings":
        const rowDataLocal = [
          { param: "allergy", value: "koty" },
          { param: "inne", value: "xxx" },
        ] as never;
        setRowData(rowDataLocal || []);
        break;

      default:
        alert(`Fetch tags zbłądziło...`);
    }
  } catch (error) {
    alert("Failed to load tags:" + JSON.stringify(error));
  }
};

// const formFetchData = async (objectId: string, images: any[], setRowData: React.Dispatch<React.SetStateAction<never[]>>) => {
//   try {
//     let rowDataLocal: any;
//     if (objectId == "settings") {
//       rowDataLocal = [
//         { param: "allergy", value: "koty" },
//         { param: "inne", value: "xxx" },
//       ];
//     } else {
//       rowDataLocal = images.map((image, idx) => ({
//         id: idx + 1,
//         imageUrl: `data:image/jpeg;base64,${image.base64String}`,
//         name: image.name,
//       }));
//     }
//     setRowData(rowDataLocal || []);
//   } catch (error) {
//     console.error("Failed to load tags:", error);
//   }
// };

// async function getMetaDataTag() {
//   // try {
//   //   const result = await graphqlClient(`
//   //   query {
//   //     data(params: { type: "colDefs", user: username" })
//   //   }
//   // `);
//   //   return result.data;
//   // } catch (error) {
//   //   console.error("Failed to fetch column definitions:", error);
//   //   return [];
//   // }
//   return [
//     {
//       headerName: "Tag",
//       field: "tag",
//       flex: true,
//       // cellRenderer: (params: any) => (
//       //   <TagCellRenderer {...params} takePhoto={takePhoto} />
//       // ),
//     },
//     {
//       headerName: "Browse",
//       field: "count",
//       width: 100,
//       // cellRenderer: (params: any) => (
//       //   <TagCountCellRenderer {...params} browse={browse} />
//       // ),
//     },
//   ];
// }

// async function getDataTag() {
//   // try {
//   //   const result = await graphqlClient(`
//   //   query {
//   //     data(params: { type: "data", user: username })
//   //   }
//   // `);
//   //   return result.data;
//   // } catch (error) {
//   //   console.error("Failed to fetch data:", error);
//   //   return [];
//   // }
// }

// async function getMetaData() {
//   try {
//     const result = await graphqlClient(`
//     query {
//       data(params: { type: "colDefs", user: username })
//     }
//   `);
//     return result.data;
//   } catch (error) {
//     console.error("Failed to fetch column definitions:", error);
//     return [];
//   }
// }

// async function getData() {
//   try {
//     const result = await graphqlClient(`
//     query {
//       data(params: { type: "data", user: username })
//     }
//   `);
//     return result.data;
//   } catch (error) {
//     console.error("Failed to fetch data:", error);
//     return [];
//   }
// }

// const TagCellRenderer: FunctionComponent<CustomCellRendererProps & { takePhoto: (tag: string) => void }> = ({ data, takePhoto }) => {
//   return (
//     data && (
//       <button className="flex items-center w-full p-2 text-white bg-green-500 rounded hover:bg-blue-700" onClick={() => takePhoto(data.tag)}>
//         <FaCamera className="text-3xl mr-1" />
//         {data.tag}
//       </button>
//     )
//   );
// };

// const TagCellRenderer: FunctionComponent<CustomCellRendererProps> = ({
//   data,
// }) => {
//   console.log(data);
//   return (
//     data && (
//       <button
//         className="flex items-center w-full p-2 text-white bg-green-500 rounded hover:bg-blue-700"
//         onClick={() => alert(`takePhoto`) /*takePhoto(params.value)*/}
//       >
//         <FaCamera className="text-3xl mr-1" />
//         {data.tag}
//       </button>
//     )
//   );
// };

// const TagCountCellRenderer: FunctionComponent<CustomCellRendererProps & { browse: (tag: string) => void }> = ({ data, browse }) => {
//   return (
//     data && (
//       <button className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700" onClick={() => browse(data.tag)}>
//         <FaFolderOpen className="text-3xl mr-1" />
//         {data.count}
//       </button>
//     )
//   );
// };
// const TagCountCellRenderer: FunctionComponent<CustomCellRendererProps> = ({
//   data,
// }) => {
//   const { browse } = useSession();

//   return (
//     data && (
//       <button
//         className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700"
//         //onClick={() => alert(`browse`) /*browse(params.data.tag)*/}
//         onClick={() => browse(data.tag /*params.data.tag*/)}
//       >
//         <FaFolderOpen className="text-3xl mr-1" />
//         {data.count}
//       </button>
//     )
//   );
// };

function parseTagFolderName(folderName: string): { tagType: string; tagName: string } | null {
  const regex = /\[([^\]]+)\]\s*(.*)/;
  const match = folderName.match(regex);

  if (match) {
    const [, tagType, rest] = match;
    const tagName = rest.trim(); // Usuń dodatkowe spacje, jeśli występują
    return { tagType, tagName };
  } else {
    return { tagType: "Brak kategorii", tagName: folderName };
  }
}

export {
  // getMetaData,
  // getData,
  // getMetaDataTag,
  // getDataTag,
  //TagCellRenderer,
  //TagCountCellRenderer,
  //formFetchData,
  fetchData,
  parseTagFolderName,
  fetchColumnDefs,
};
