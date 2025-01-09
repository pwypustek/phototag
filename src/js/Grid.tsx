import { forwardRef, useImperativeHandle, useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { RowSelectionOptions } from "@ag-grid-community/core";
import { fetchColumnDefs, fetchData } from "./Data";
import { useSession } from "./SessionContext";

interface GridProps {
  objectId: string;
  objectArgs: any;
  gridRefresh?: () => void;
  onSelectionChanged?: (selectedRow: any) => void;
  onCellClicked?: (image: string) => void;

  gridParam?: Record<string, any>;
  takePhoto?: (tag: string) => void;
  browse?: (tag: string) => void;
  onClose?: () => void;
}

interface GridRef {
  Refresh: () => void;
}

const Grid = forwardRef<GridRef, GridProps>(({ objectId, objectArgs, gridRefresh, /*rowData,*/ onSelectionChanged, onCellClicked, gridParam = {}, takePhoto, browse, onClose }, ref) => {
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [rowDataTag, setRowDataTag] = useState([]);
  const { username, sessionId, cwid, isLoggedIn } = useSession();

  const Refresh = () => {
    if (isLoggedIn) {
      fetchData(objectId, objectArgs, username, (data) => {
        console.log("Updating rowDataTag");
        setRowDataTag(data);
      });
    }
  };

  // Eksponowanie metody Refresh
  useImperativeHandle(ref, () => ({
    Refresh,
  }));

  // Dodatkowy Kontekst
  // W AgGrid, pole context jest mechanizmem umożliwiającym przekazywanie niestandardowych danych lub funkcji do rendererów komórek (cellRenderer).
  // Dzięki temu renderer wie, jakie operacje wykonać (np. takePhoto, browse) dla danej komórki.
  useEffect(
    () => {
      const loadColumnDefs = async () => {
        console.log(`loadColumnDefs objectId ${objectId}, objectArgs ${objectArgs}`);
        const defs = await fetchColumnDefs(objectId);

        // 1. Dodanie kontekstu do każdej kolumny
        const enhancedDefs = defs.map((def: any) => {
          //Iterujemy po tablicy defs (zawierającej definicje kolumn) i tworzymy nową tablicę, gdzie każda kolumna (def) jest wzbogacona o dodatkowe pole context.
          return {
            ...def, // Zachowujemy oryginalne właściwości kolumny, Rozwinięcie właściwości (...def):
            // Operator rozproszenia (...) kopiuje wszystkie istniejące właściwości obiektu def do nowego obiektu.
            // Dzięki temu nie musimy ręcznie wymieniać każdej właściwości kolumny.
            context: {
              takePhoto, // Funkcja przekazana z propsów
              browse, // Funkcja przekazana z propsów
              onCellClicked, // Funkcja przekazana z propsów
            },
          };
        });

        // 2. Ustawienie zaktualizowanych definicji kolumn w stanie
        setColumnDefs(enhancedDefs);

        // poniżej bez refaktoringu
        // setColumnDefs(
        //   defs.map((def) => ({
        //     ...def,
        //     context: { takePhoto, browse, onCellClicked },
        //   }))
        // );

        // jak tutaj jest wywołane to jakoś wolniej wczytuje, jest widoczne opóźnenie
        // if (isLoggedIn) {
        //   fetchData(objectId, objectArgs, username, (data) => {
        //     console.log("Updating rowDataTag"); // <- Render na zmianę `rowDataTag`
        //     setRowDataTag(data);
        //   });
        // }
      };
      if (isLoggedIn) {
        loadColumnDefs();
      }
    },
    [
      /*objectId, objectArgs*/
      /*, gridRefresh, takePhoto, browse, onCellClicked*/
    ]
  ); //

  useEffect(() => {
    if (isLoggedIn) {
      fetchData(objectId, objectArgs, username, (data) => {
        console.log("fetchData"); // <- Render na zmianę `rowDataTag`
        setRowDataTag(data);
      });
    }
  }, []);

  const rowSelection = useMemo<RowSelectionOptions | "single" | "multiple">(() => {
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

  const rowHeight = 60;
  let headerHeight;
  if (gridParam.header) {
    headerHeight = 50;
  } else {
    headerHeight = 0;
  }
  if (objectId == "settings") {
    headerHeight = 50;
  }

  return (
    //<div className="ag-theme-alpine" style={{ height: "100%", width: "100%" }}>
    <div className="ag-theme-alpine h-full w-full" style={{ height: "calc(100vh - 148px)" }}>
      <AgGridReact
        rowData={rowDataTag}
        columnDefs={columnDefs as never}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        rowSelection={rowSelection as never}
        onSelectionChanged={(event) => {
          onSelectionChanged?.(event.api.getSelectedRows()[0] || null);
        }}
      />
    </div>
  );
});

export { Grid, type GridRef };
