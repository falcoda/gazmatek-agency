import { useEffect, useState } from "react";

import { StyledInputBase } from "../StyledInput";
const StyledInputFile: React.FC<{
  label: string;
  setValue: (file: File | null) => void;
  value?: File | null | string;
  required?: boolean;
  accept?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ label, setValue, required, accept, className, value, style }) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setValue(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
      setFileType(file.type);
    } else if (typeof value === "string") {
      setFilePreview(value);
      return;
    } else {
      setFilePreview(null);
      setFileType(null);
    }
  };

  useEffect(() => {
    if (typeof value === "string") {
      setFilePreview(value);
      setFileType("image/png");
      return;
    }
    if (value) {
      const previewUrl = URL.createObjectURL(value);
      setFilePreview(previewUrl);
      setFileType(value.type);
    }
  }, [value]);

  return (
    <StyledInputBase
      label={label}
      value={""}
      setValue={setValue}
      type="file"
      className={className ?? ""}
      style={style}
    >
      <input
        type="file"
        onChange={handleFileChange}
        required={required}
        accept={accept}
      />
      {filePreview && fileType && (
        <div className="filePreview">
          {fileType === "application/pdf" ? (
            <embed src={filePreview} width="100%" height="400px" />
          ) : /^image\/(jpeg|png|svg\+xml)$/.test(fileType) ? (
            <img
              src={filePreview}
              alt="Aperçu du fichier"
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            />
          ) : (
            <p>File type not supported</p>
          )}
        </div>
      )}
    </StyledInputBase>
  );
};

export default StyledInputFile;
