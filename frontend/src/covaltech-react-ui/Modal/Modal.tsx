import "./Modal.scss";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { GrClose } from "../../assets/svg/svgIcons";
import Button from "../Button/Button";

interface ModalProps {
  modalButton: (props: {
    onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  }) => React.ReactElement;
  modalTitle: string | React.ReactElement;
  modalCloseIcon?: boolean;
  modalContent: React.ReactElement;
  modalGap?: string;
  modalFooterButton: React.ReactElement;
  modalFooterClass?: string;
  onClick?: () => void;
  modalCancel?: boolean;
  className?: string;
  defaultOpen?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  className,
  modalButton,
  modalTitle,
  modalCloseIcon = false,
  modalContent,
  modalGap = "10px",
  modalFooterButton,
  modalFooterClass,
  onClick,
  modalCancel = true,
  defaultOpen = false,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(defaultOpen);
  const modalRef = useRef<HTMLDivElement>(null);

  function handleOpenModal(e?: React.MouseEvent<HTMLButtonElement>) {
    if (e) e.stopPropagation(); // Prevent event propagation
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
      event.stopPropagation();
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
      <ModalButton onClick={(e) => handleOpenModal(e)} />

      {createPortal(
        showConfirmDialog && (
          <div
            className={`modalContainer ${className ?? ""}`}
            onClick={(e) => {
              // Stop React synthetic events
              e.stopPropagation();
            }}
          >
            <div
              className="modal"
              ref={modalRef}
              style={{ gap: modalGap }}
              onClick={(e) => {
                // Ensure clicks inside modal content don't bubble to parent React tree
                e.stopPropagation();
              }}
            >
              <div className="modalHeader">
                {(modalCloseIcon || !modalTitle || modalTitle === "") && (
                  <GrClose
                    className="grClose"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseModal();
                    }}
                  />
                )}
                {modalTitle !== "" && (
                  <div className="modalTitle">{modalTitle}</div>
                )}
              </div>

              <div>{modalContent}</div>
              {(modalFooterButton || modalCancel) && (
                <div
                  className={`buttonWrapper ${modalFooterClass ? modalFooterClass : ""}`}
                >
                  {modalFooterButton}
                  {modalCancel && (
                    <Button
                      onClick={(e) => {
                        if (e) {
                          e.stopPropagation();
                        }
                        handleCloseModal();
                      }}
                      label="Cancel"
                      margin="0 5px 0 auto"
                      style="transparent"
                      height={19}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ),
        document.getElementById("root")!,
      )}
    </>
  );
};

export default Modal;
