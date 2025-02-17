import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { EditorProps } from "@monaco-editor/react";
import type monaco from "monaco-editor";

//let monacoEditorInstance: monaco.editor.IStandaloneCodeEditor;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "alert" | "prompt" | "promptWithTagType" | "confirm" | "monaco";
  message?: string;
  defaultValue?: string;
  defaultTagType?: string;
  readonly?: boolean; // Dodano parametr readonly
  resolve: (value: { value?: string; selectedTagType?: string } | { value: string } | null) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  message = "",
  defaultValue = "",
  defaultTagType = "Brak kategorii",
  readonly = false, // Domyślnie false
  resolve,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [selectedOption, setSelectedOption] = useState(defaultTagType); // Ustawienie wartości domyślnej
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  //const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setSelectedOption(defaultTagType);
      if ((type === "prompt" || type === "promptWithTagType") && inputRef.current) {
        inputRef.current.focus();
      }
      if (type === "monaco" && editorRef.current) {
        editorRef.current.focus();
      }
    }
  }, [isOpen, type, defaultValue, defaultTagType]);

  const handleEditorDidMount: EditorProps["onMount"] = (editor) => {
    editorRef.current = editor;
    if (!readonly) {
      editor.focus();
    }
  };

  if (!isOpen) return null;

  const handleConfirm = (confirmed: boolean) => {
    resolve(confirmed ? { value: "confirmed" } : { value: "cancelled" });
    onClose();
  };

  const handleSubmit = () => {
    const result = type === "promptWithTagType" ? { value, selectedTagType: selectedOption } : { value };
    resolve(result);
    onClose();
  };

  const handleCancel = () => {
    resolve(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className={`${type === "monaco" ? "w-full h-full" : "w-96"} p-6 bg-white rounded shadow-md overflow-hidden`}>
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {type === "confirm" ? (
          <>
            <p className="mb-4 text-lg">{message}</p>
            <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700" onClick={() => handleConfirm(true)}>
              Potwierdź
            </button>
            <button className="w-full p-2 mt-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300" onClick={() => handleConfirm(false)}>
              Anuluj
            </button>
          </>
        ) : type === "alert" ? (
          <>
            <p className="mb-4 text-lg">{message}</p>
            <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700" onClick={() => handleConfirm(true)}>
              OK
            </button>
          </>
        ) : type === "prompt" ? (
          <>
            <input type="text" ref={inputRef} className="w-full p-2 mb-4 border border-gray-300 rounded" value={value} onChange={(e) => setValue(e.target.value)} />
            <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700" onClick={handleSubmit}>
              Zatwierdź
            </button>
            <button className="w-full p-2 mt-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300" onClick={handleCancel}>
              Anuluj
            </button>
          </>
        ) : type === "promptWithTagType" ? (
          <>
            <input type="text" ref={inputRef} className="w-full p-2 mb-4 border border-gray-300 rounded" value={value} onChange={(e) => setValue(e.target.value)} />
            <select className="w-full p-2 mb-4 border border-gray-300 rounded" value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
              <option value="Brak kategorii">Brak kategorii</option>
              <option value="Budżet domowy">Budżet domowy</option>
              <option value="Kontrola alergenów">Kontrola alergenów</option>
              <option value="Dane medyczne">Dane medyczne</option>
              <option value="Firma">Firma</option>
              <option value="Remont lub budowa">Remont lub budowa</option>
              <option value="Inwentarz domowy">Inwentarz domowy</option>
              <option value="Wakacje">Wakacje</option>

              {/* <option value="Brak kategorii">Brak kategorii</option>
              <option value="Budżet domowy">Gdzie jest kasa? (Budżet domowy)</option>
              <option value="Kontrola alergenów">Znowu jakieś gówno (Kontrola alergenów)</option>
              <option value="Dane medyczne">Jak tam zdrówko (Dane medyczne)</option>
              <option value="Firma">Jebać system (Firma)</option>
              <option value="Remont lub budowa">Jak to było? (Remont lub budowa)</option>
              <option value="Inwentarz domowy">Sierściuch i inne gady(Inwentarz domowy)</option>
              <option value="Wakacje">Kiedy to było (Wakacje)</option> */}
            </select>
            <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700" onClick={handleSubmit}>
              Zatwierdź
            </button>
            <button className="w-full p-2 mt-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300" onClick={handleCancel}>
              Anuluj
            </button>
          </>
        ) : type === "monaco" ? (
          <>
            {/* <Editor height="300px" defaultLanguage="javascript" value={value} onChange={(v) => setValue(v || "")} /> */}

            <div className="monaco-editor-container border-2 border-blue-500 rounded-lg shadow-md">
              <MonacoEditor
                height="calc(100vh - 250px)" //150px  // Ustaw wysokość edytora, aby pasowała do okna modalnego
                defaultLanguage="plaintext"
                value={defaultValue} //value
                onChange={(newValue) => setValue(newValue || "")}
                options={{
                  readOnly: readonly, // Ustawienie readonly
                  lineNumbers: "off",
                  minimap: { enabled: false },
                  //glyphMargin: true,
                  folding: false,
                  scrollBeyondLastLine: false,
                  renderLineHighlight: "none",
                  overviewRulerLanes: 0,
                  hideCursorInOverviewRuler: true,
                }}
                onMount={handleEditorDidMount}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="p-2 text-white bg-blue-500 rounded hover:bg-blue-700" onClick={handleSubmit}>
                Zatwierdź
              </button>
              <button className="p-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300" onClick={handleCancel}>
                Anuluj
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export const useModal = () => {
  const [modalState, setModalState] = useState<Omit<ModalProps, "isOpen" | "onClose" | "resolve"> | null>(null);
  const [promiseResolver, setPromiseResolver] = useState<((value: { value?: string; selectedTagType?: string } | null) => void) | null>(null);

  const openModal = (title: string, options: Omit<ModalProps, "isOpen" | "onClose" | "title" | "resolve">) => {
    return new Promise((resolve) => {
      setModalState({ ...options, title });
      setPromiseResolver(() => resolve);
    });
  };

  const closeModal = () => {
    setModalState(null);
  };

  return {
    ModalComponent: modalState && (
      <Modal
        isOpen={!!modalState}
        onClose={closeModal}
        {...modalState}
        resolve={(value) => {
          promiseResolver?.(value);
          setPromiseResolver(null);
          closeModal();
        }}
      />
    ),
    openModal,
  };
};
