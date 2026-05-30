import "./StepIndicator.scss";

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

const StepIndicator = ({ current, total, labels }: StepIndicatorProps) => {
  return (
    <div className="stepIndicator">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`stepItem ${i < current ? "done" : ""} ${
            i === current ? "active" : ""
          }`}
        >
          <div className="stepDot">
            {i < current ? (
              <svg
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="stepLabel">{labels[i]}</span>
          {i < total - 1 && <div className="stepLine" />}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
