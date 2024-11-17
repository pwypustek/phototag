import { graphqlClient } from "./graphqlClient";
import type { CustomCellRendererProps } from "@ag-grid-community/react";
import { type FunctionComponent } from "react";
import { FaCamera, FaFolderOpen } from "react-icons/fa";

const formFetchData = async (
  objectId: string,
  images: any[],
  setRowData: React.Dispatch<React.SetStateAction<never[]>>
) => {
  try {
    let rowDataLocal: any;
    if (objectId == "settings") {
      rowDataLocal = [
        { param: "allergy", value: "koty" },
        { param: "inne", value: "xxx" },
      ];
    } else {
      rowDataLocal = images.map((image, idx) => ({
        id: idx + 1,
        imageUrl: `data:image/jpeg;base64,${image.base64String}`,
        name: image.name,
      }));
    }
    setRowData(rowDataLocal || []);
  } catch (error) {
    console.error("Failed to load tags:", error);
  }
};

const fetchTags = async (
  objectId: string,
  username: string | null,
  setRowData: React.Dispatch<React.SetStateAction<never[]>>
) => {
  try {
    const result = await graphqlClient(`photo`, {
      type: "tag",
      user: username,
    });
    setRowData(result.photo.tags || []);
  } catch (error) {
    console.error("Failed to load tags:", error);
  }
};

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

const TagCellRenderer: FunctionComponent<
  CustomCellRendererProps & { takePhoto: (tag: string) => void }
> = ({ data, takePhoto }) => {
  return (
    data && (
      <button
        className="flex items-center w-full p-2 text-white bg-green-500 rounded hover:bg-blue-700"
        onClick={() => takePhoto(data.tag)}
      >
        <FaCamera className="text-3xl mr-1" />
        {data.tag}
      </button>
    )
  );
};

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

const TagCountCellRenderer: FunctionComponent<
  CustomCellRendererProps & { browse: (tag: string) => void }
> = ({ data, browse }) => {
  return (
    data && (
      <button
        className="relative flex items-center justify-center w-full h-full p-2 text-white bg-yellow-500 rounded hover:bg-blue-700"
        onClick={() => browse(data.tag)}
      >
        <FaFolderOpen className="text-3xl mr-1" />
        {data.count}
      </button>
    )
  );
};
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

function parseTagFolderName(
  folderName: string
): { tagType: string; tagName: string } | null {
  const regex = /\[([^\]]+)\]\s*(.*)/;
  const match = folderName.match(regex);

  if (match) {
    const [, tagType, rest] = match;
    const tagName = rest.trim(); // Usuń dodatkowe spacje, jeśli występują
    return { tagType, tagName };
  } else {
    return { tagType: "Brak kategorii", tagName: folderName };
  }

  return null; // Jeśli format jest niepoprawny
}
export {
  // getMetaData,
  // getData,
  // getMetaDataTag,
  // getDataTag,
  TagCellRenderer,
  TagCountCellRenderer,
  formFetchData,
  fetchTags,
  parseTagFolderName,
};
