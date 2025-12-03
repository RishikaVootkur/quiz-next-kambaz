"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "next/navigation";
import { ListGroup, ListGroupItem, FormControl } from "react-bootstrap";
import { BsGripVertical } from "react-icons/bs";
import ModulesControls from "./ModulesControls";
import LessonControlButtons from "./LessonControlButtons";
import ModuleControlButtons from "./ModuleControlButtons";
import { RootState } from "../../../store";
import { setModules, addModule, editModule, updateModule } from "./reducer"; // addModule is imported here
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import * as client from "../../client";

export default function Modules() {
  const params = useParams();
  const cid = String(params.cid ?? "");
  const { modules } = useSelector((state: RootState) => state.modulesReducer);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY";
  const dispatch = useDispatch();

  const onUpdateModule = async (module: any) => {
    await client.updateModule(module);
    const newModules = modules.map((m: any) =>
      m._id === module._id ? module : m
    );
    dispatch(setModules(newModules));
  };

  const onRemoveModule = async (moduleId: string) => {
    await client.deleteModule(moduleId);
    dispatch(setModules(modules.filter((m: any) => m._id !== moduleId)));
  };

  const fetchModules = async () => {
    const list = await client.findModulesForCourse(cid);
    dispatch(setModules(list ?? []));
  };

  useEffect(() => {
    if (cid) fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  const [moduleName, setModuleName] = useState("");

  const onCreateModuleForCourse = async () => {
    if (!cid || !moduleName.trim()) return;
    
    const payload = { name: moduleName.trim(), course: cid };
    
    const createdModule = await client.createModuleForCourse(cid, payload);
    
    dispatch(addModule(createdModule));
    
        setModuleName("");
  };

  return (
    <div>
      <ModulesControls
        setModuleName={setModuleName}
        moduleName={moduleName}
        isFaculty={isFaculty}
        addModule={onCreateModuleForCourse} // This calls onCreateModuleForCourse
      />
      <br />
      <br />
      <br />
      <br />

      <ListGroup id="wd-modules" className="rounded-0">
        {(modules ?? []).map((module: any) => (
          <ListGroupItem
            key={module._id}
            className="wd-module p-0 mb-5 fs-5 border-gray"
          >
            <div className="wd-title p-3 ps-2 bg-secondary">
              <BsGripVertical className="me-2 fs-3" />
              {/* Display module name when not editing */}
              {(!module.editing || !isFaculty) && module.name}
              {/* Show input field when editing */}
              {isFaculty && module.editing && (
                <FormControl
                  className="w-50 d-inline-block"
                  onChange={(e) =>
                    dispatch(updateModule({ ...module, name: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onUpdateModule({ ...module, editing: false });
                    }
                  }}
                  defaultValue={module.name}
                />
              )}
              {isFaculty && (
                <ModuleControlButtons
                  moduleId={module._id}
                  deleteModule={(moduleId) => onRemoveModule(moduleId)}
                  editModule={(moduleId) => dispatch(editModule(moduleId))}
                />
              )}
            </div>

            {module.lessons && (
              <ListGroup className="wd-lessons rounded-0">
                {module.lessons.map((lesson: any) => (
                  <ListGroupItem
                    key={lesson._id}
                    className="wd-lesson p-3 ps-1"
                  >
                    <BsGripVertical className="me-2 fs-3" /> {lesson.name}{" "}
                    <LessonControlButtons />
                  </ListGroupItem>
                ))}
              </ListGroup>
            )}
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
}