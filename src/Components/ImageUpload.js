import React from "react";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import {
  onChildAdded,
  push,
  ref as databaseRef,
  set,
  query,
  limitToFirst,
} from "firebase/database";

import { database, storage } from "../Db/firebase";

export default class ImageUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fileInputValue: "",
      fileInputFile: null,
      title: "",
      imageSRC: "",
      currentArray: [],
    };
  }

  componentDidMount() {
    // add in some additional API call to firebase to retreive all posts when loaded.

    const messageRef = databaseRef(database, `messages`);

    onChildAdded(messageRef, (data) => {
      this.setState((state) => ({
        currentArray: [
          ...state.currentArray,
          { key: data.key, val: data.val() },
        ],
      }));
    });
  }

  sendData = (e) => {
    e.preventDefault();

    const storageRefInstance = storageRef(
      storage,
      "fruit" + "/" + this.state.fileInputFile.name
    );

    const messageListRef = databaseRef(database, "messages");
    const newMessageRef = push(messageListRef);

    uploadBytes(storageRefInstance, this.state.fileInputFile).then(
      (snapshot) => {
        console.log("WOWOWOWOWOWOWOWOWOWOWO YEAYYAYAY");

        // just uploading the image
        // get the image
        getDownloadURL(storageRefInstance).then((url) => {
          // this.setState({ imageSRC: url });

          console.log(url);

          set(newMessageRef, {
            date: new Date().toLocaleString(),
            message: this.state.title,
            image: url,
          });

          this.setState({
            fileInputFile: null,
            fileInputValue: "",
            title: "",
          });
        });
      }
    );
  };

  render() {
    return (
      <div>
        <form>
          <input
            type="text"
            name="title"
            value={this.state.title}
            onChange={(e) => this.setState({ title: e.target.value })}
            placeholder="Title of image!"
          />

          <input
            type="file"
            name="fileInputFile"
            value={this.state.fileInputValue}
            onChange={(e) => {
              console.log(e.target.files);
              console.log(e.target.files[0].name);
              this.setState({
                fileInputFile: e.target.files[0],
                fileInputValue: e.target.value,
              });
            }}
          />

          <button onClick={(e) => this.sendData(e)}>Send</button>
        </form>

        {/* <img
          style={{ height: "50vh" }}
          src={this.state.imageSRC}
          alt="photo?"
        /> */}

        {this.state.currentArray && this.state.currentArray.length > 0 ? (
          this.state.currentArray.map((element) => (
            <div key={element.key}>
              <img
                style={{ height: "40vh" }}
                src={element.val.image}
                alt={element.val.message}
              />
              <h4>
                {element.val.message} - {element.val.date}
              </h4>
            </div>
          ))
        ) : (
          <>
            <p>Sam failed</p>
          </>
        )}
      </div>
    );
  }
}
