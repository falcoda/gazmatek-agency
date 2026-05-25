import "./Spinner.scss";

interface SpinnerProps {
  color?: `#${string}`;
  size?: number;
}
const Spinner = ({ color, size = 70 }: SpinnerProps) => {
  // Clamp size between 24 and 70
  const spinnerSize = Math.min(Math.max(size, 24), 70);
  // Ball size is 11% of spinner size (≈8px for 70px)
  const ballSize = spinnerSize * 0.114;

  return (
    <div
      className="spinnerContainer"
      style={{
        // Use CSS variables for size
        ["--spinner-size" as any]: `${spinnerSize}px`,
        ["--ball-size" as any]: `${ballSize}px`,
      }}
    >
      <div className="spinner">
        <span
          className="ball-1"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-2"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-3"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-4"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-5"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-6"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-7"
          style={{
            backgroundColor: color,
          }}
        ></span>
        <span
          className="ball-8"
          style={{
            backgroundColor: color,
          }}
        ></span>
      </div>
    </div>
  );
};

export default Spinner;
