import { Router } from "express";
import {authorizedRoles, authorizeSubscriber, isLoggedIn} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import
{addLectureToCourseById,
createCourse,
getAllCoures,
getLecturesByCourseId,
removeCourse,
removeLectureFromCourse,
updateCourseById,    
} from "../controllers/course.controller.js"

const router = new Router();

router.route("/")
    .get(getAllCoures)
    .post(isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourse)
    .delete(isLoggedIn, authorizedRoles('ADMIN'), removeLectureFromCourse);

router.route("/:id")
    .get(isLoggedIn,authorizeSubscriber,getLecturesByCourseId)
    .patch(isLoggedIn,authorizedRoles("ADMIN"), updateCourseById)
    .delete(isLoggedIn, authorizedRoles("ADMIN"), removeCourse)
    .post(isLoggedIn,authorizedRoles("ADMIN"),upload.single("lecture"),addLectureToCourseById);

export default router;