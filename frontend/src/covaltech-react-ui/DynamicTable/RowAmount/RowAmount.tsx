import "./RowAmount.scss";

import Button from "../../Button/Button";
interface RowAmountProps {
  maxRows: number;
  setMaxRows: (maxRows: number) => void;
}
const RowAmount: React.FC<RowAmountProps> = ({ maxRows, setMaxRows }) => {
  return (
    <div className="rowAmount">
      <Button
        className={`rowAmountButton ${maxRows === 10 ? "selected" : ""}`}
        onClick={() => setMaxRows(10)}
        style="square"
        label="10"
      />
      <Button
        className={`rowAmountButton ${maxRows === 25 ? "selected" : ""}`}
        onClick={() => setMaxRows(25)}
        style="square"
        label="25"
      />
      <Button
        className={`rowAmountButton ${maxRows === 50 ? "selected" : ""}`}
        onClick={() => setMaxRows(50)}
        style="square"
        label="50"
      />
    </div>
  );
};

export default RowAmount;
