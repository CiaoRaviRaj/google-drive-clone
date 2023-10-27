import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { storage, database } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ROOT_FOLDER } from "../../hooks/useFolder";
import { createPortal } from "react-dom";
import { ProgressBar, Toast } from "react-bootstrap";
export default function AddFileButton({ currentFolder }) {
  const { currentUser } = useAuth();
  const [uploadingFiles, setUploadingFiles] = useState([]);
  async function handleFileChange(e) {
    const file = e.target.files[0];
    console.log("file: ", file);
    e.target.value = null;
    if (currentFolder == null || file == null) return;

    const filePath =
      currentFolder === ROOT_FOLDER
        ? `${currentFolder.path.map((item) => item.name).join("/")}/${
            file.name
          }`
        : `${currentFolder.path.map((item) => item.name).join("/")}/${
            currentFolder.name
          }/${file.name}`;
    const id = crypto.randomUUID();
    setUploadingFiles((preUploadingFiles) => [
      ...preUploadingFiles,
      {
        id: id,
        name: file.name,
        progress: 0,
        error: false,
      },
    ]);
    const uploadTask = storage
      .ref(`/files/${currentUser.uid}/${filePath}`)
      .put(file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        console.log(
          "snap value",
          snapshot.bytesTransferred / snapshot.totalBytes
        );
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        setUploadingFiles((preUploadingFiles) => {
          return preUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, progress: progress };
            }
            return uploadFile;
          });
        });
      },
      (err) => {
        console.log("Error uploading", err);
        setUploadingFiles((preUploadingFiles) => {
          return preUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, error: true };
            }
            return uploadFile;
          });
        });
      },
      (success) => {
        console.log("Successfully uploaded");
        setTimeout(() => {
          setUploadingFiles((preUploadingFiles) =>
            preUploadingFiles.filter((uploadFile) => uploadFile.id !== id)
          );
        }, 500);

        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          database.files
            .where("name", "==", file.name)
            .where("userId", "==", currentUser.uid)
            .where("folderId", "==", currentFolder.id)
            .get()
            .then((existingFiles) => {
              const existingFile = existingFiles.docs[0];
              if (existingFile) {
                existingFile.ref.update({ url: url });
              } else {
                database.files.add({
                  url: url,
                  name: file.name,
                  type: file.type,
                  createdAt: database.getCurrentTimestamp(),
                  folderId: currentFolder.id ? currentFolder.id : null,
                  userId: currentUser.uid,
                });
              }
            });
        });
      }
    );
  }
  return (
    <>
      <label className="btn btn-outline-success btn-sm m-0 mr-2">
        <FontAwesomeIcon icon={faFileUpload} />
        <input
          type="file"
          onChange={handleFileChange}
          style={{ opacity: 0, position: "absolute", left: "-3333px" }}
        />
      </label>
      {uploadingFiles.length > 0 &&
        createPortal(
          <div
            className=""
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              maxWidth: "250px",
            }}>
            {uploadingFiles.map((uploadingFile) => (
              <Toast
                key={uploadingFile.id}
                onClose={() => {
                  setUploadingFiles((prev) =>
                    prev.filter((item) => item.id !== uploadingFile.id)
                  );
                }}>
                <Toast.Header
                  closeButton={uploadingFile.error}
                  className="text-truncate w-100 d-block">
                  {uploadingFile.name}
                </Toast.Header>
                <Toast.Body>
                  <ProgressBar
                    animated={!uploadingFile.error}
                    variant={uploadingFile.error ? "danger" : "primary"}
                    now={
                      uploadingFile.error ? 100 : uploadingFile.progress * 100
                    }
                    label={
                      uploadingFile.error
                        ? "Error"
                        : `${Math.round(uploadingFile.progress * 100)}`
                    }
                  />
                  {console.log(uploadingFile.progress * 100)}
                </Toast.Body>
              </Toast>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
