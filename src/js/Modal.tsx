import React, { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultValue?: string;
  resolve: (value: string | null) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  defaultValue = "",
  resolve,
}) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus(); // Set focus on the input when modal opens
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue); // Set value when defaultValue changes
    }
  }, [defaultValue, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    resolve(value);
    onClose();
  };

  const handleCancel = () => {
    resolve(null); // Reject the value if the user cancels
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="p-6 bg-white rounded shadow-md w-80">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        <input
          type="text"
          ref={inputRef} // Attach ref to input for focusing
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Zatwierdź
        </button>
        <button
          className="w-full p-2 mt-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          onClick={handleCancel}
        >
          Anuluj
        </button>
      </div>
    </div>
  );
};

interface AlertModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  resolve: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  message,
  onClose,
  resolve,
}) => {
  if (!isOpen) return null;

  const handleOk = () => {
    resolve();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="p-6 bg-white rounded shadow-md w-80">
        <p className="mb-4 text-lg">{message}</p>
        <button
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-700"
          onClick={handleOk}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export { Modal, AlertModal };
