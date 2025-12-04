"use client";

import React, { useState } from "react";
import { FormControl, FormCheck } from "react-bootstrap";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER || "";

export default function WorkingWithObjects() {
  const [moduleName, setModuleName] = useState("Intro to React");
  const [moduleDesc, setModuleDesc] = useState("Basics of components and hooks");
  const [score, setScore] = useState("90");
  const [completed, setCompleted] = useState(false);

  return (
    <div id="wd-working-with-objects">
      <h3>Module</h3>

      <FormControl
        className="mb-2"
        id="wd-module-name-input"
        value={moduleName}
        onChange={(e) => setModuleName(e.currentTarget.value)}
        placeholder="New module name"
      />

      <FormControl
        className="mb-2"
        id="wd-module-description-input"
        value={moduleDesc}
        onChange={(e) => setModuleDesc(e.currentTarget.value)}
        placeholder="New module description"
      />

      <a
        id="wd-get-module"
        className="btn btn-light me-2"
        href={`${HTTP_SERVER}/lab5/module`}
      >
        Get Module
      </a>

      <a
        id="wd-get-module-name"
        className="btn btn-outline-light me-2"
        href={`${HTTP_SERVER}/lab5/module/name`}
      >
        Get Module Name
      </a>

      <a
        id="wd-update-module-name"
        className="btn btn-primary me-2"
        href={`${HTTP_SERVER}/lab5/module/name/${encodeURIComponent(moduleName)}`}
      >
        Update Module Name
      </a>

      <a
        id="wd-update-module-description"
        className="btn btn-primary"
        href={`${HTTP_SERVER}/lab5/module/description/${encodeURIComponent(
          moduleDesc
        )}`}
      >
        Update Module Description
      </a>

      <hr />

      <h3>Assignment</h3>

      <FormControl
        className="mb-2"
        id="wd-assignment-score-input"
        type="number"
        value={score}
        onChange={(e) => setScore(e.currentTarget.value)}
        placeholder="Score"
      />

      <FormCheck
        className="mb-2"
        id="wd-assignment-completed-input"
        type="checkbox"
        label="Completed"
        checked={completed}
        onChange={(e) => setCompleted(e.currentTarget.checked)}
      />

      <a
        id="wd-update-assignment-score"
        className="btn btn-success me-2"
        href={`${HTTP_SERVER}/lab5/assignment/score/${score}`}
      >
        Update Score
      </a>

      <a
        id="wd-update-assignment-completed"
        className="btn btn-warning"
        href={`${HTTP_SERVER}/lab5/assignment/completed/${completed}`}
      >
        Update Completed
      </a>

      <hr />
    </div>
  );
}