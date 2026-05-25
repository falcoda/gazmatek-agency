import "./ModalContent.scss";

import Button from "../../../Button/Button";

const ModalContent = () => {
  return <div className="modalContent">Are you sure you want to log out?</div>;
};

const ModalFooterButton = () => {
  async function handleConfirmDisconnect() {
    document.location.reload();
  }
  return (
    <Button onClick={handleConfirmDisconnect} label="Log Out" style="blue" />
  );
};

export default ModalContent;
export { ModalFooterButton };
