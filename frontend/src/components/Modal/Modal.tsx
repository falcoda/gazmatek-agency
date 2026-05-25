import "./Modal.scss";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";

import Button from "../Button/Button";

interface ModalProps {
  modalButton: (props: { onClick: () => void }) => React.ReactElement;
  modalTitle: string;
  modalContent: React.ReactElement;
  modalFooterButton: React.ReactElement;
  modalFooterClass?: string;
  onClick?: () => void;
  modalCancel?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  className,
  modalButton,
  modalTitle,
  modalContent,
  modalFooterButton,
  modalFooterClass,
  onClick,
  modalCancel = true,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  function handleOpenModal() {
    setShowConfirmDialog(true);
    if (onClick) {
      onClick();
    }
  }

  function handleCloseModal() {
    setShowConfirmDialog(false);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.code === "Escape" || event.code === "Delete") {
      handleCloseModal();
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleModalClick(event: MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setShowConfirmDialog(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleModalClick);

    return () => {
      document.removeEventListener("mousedown", handleModalClick);
    };
  }, []);

  const ModalButton = modalButton;

  return (
    <>
      <ModalButton onClick={handleOpenModal} />

      {ReactDOM.createPortal(
        showConfirmDialog && (
          <div className={`modalContainer ${className ?? ""}`}>
            <div className="modal" ref={modalRef}>
              {modalTitle !== "" ? (
                <div className="modalTitle">{modalTitle}</div>
              ) : (
                <FaTimes className="grClose" onClick={handleCloseModal} />
              )}
              <FaTimes className="grClose" onClick={handleCloseModal} />
              <div>{modalContent}</div>
              <div
                className={`buttonWrapper ${
                  modalFooterClass ? modalFooterClass : ""
                }`}
              >
                {modalFooterButton}
                {modalCancel && (
                  <Button
                    onClick={handleCloseModal}
                    label="Cancel"
                    width={100}
                    height={40}
                    padding="0px 10px"
                    margin="0 0 0 auto"
                    style="transparent"
                  />
                )}
              </div>
              <div className={`blob blob-1`}></div>
            </div>
          </div>
        ),
        document.getElementById("root")!,
      )}
    </>
  );
};

export default Modal;
