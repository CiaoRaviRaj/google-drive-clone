import { faFile, faImage, faFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function File({ file }) {
  return (
    <a
      href={file.url}
      target="_blank"
      className="btn btn-outline-dark text-truncate w-100">
      <FontAwesomeIcon
        className="mr-2"
        style={{
          color:
            (file.type && file.type.startsWith("image/")) ||
            file.type.startsWith("video/")
              ? "red"
              : "#6991d6",
        }}
        icon={
          file.type && file.type.startsWith("image/")
            ? faImage
            : file.type.startsWith("video/")
            ? faFilm
            : faFile
        }
      />

      {file.name}
    </a>
  );
}
