import Course from "../models/course.model.js"
import {destroyFile, uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/error.util.js";
import cloudinary from "cloudinary";

const getAllCoures = async(req, res,next) =>{
   try {
     const courses = await Course.find({}).select("-lectures");
     if(!courses){
         return next(new ApiError("Course is not exist",400));

    }
    return res.status(200).json({
        success:true,
        message:"All courses fetch successfully ",
        courses
    })

   } catch (error) {
        return next(new ApiError(error.message,500))
    
   }

}
const getLecturesByCourseId = async(req,res,next) =>{
     try {
        const {id} = req.params; 
     const course = await Course.findById(id);
     if(!course){
         return next(new ApiError("Course does not exits  ",400));

    }
    return res.status(200).json({
        success:true,
        message:"Course lectures fetched successfully ",
        lectures:course.lectures
    });

   } catch (error) {
        return next(new ApiError(error.message,500));    
   }
}
const createCourse = async(req, res, next) =>{
    try {
        const {title, description, category, createdBy} = req.body;
        
        if(!title || !description || !category || !createdBy){
            return next(new ApiError("All fields are required",400));  
        }     
        const{path} = req.file;
               
        if (!path) {
             return next(new ApiError("Thumbnail is meassing",400));
        }
        const thumbnail = await uploadOnCloudinary(path);
      
        
        if(!thumbnail.url){
            return next("Error while uploading  thumbnail on cloudinary ",400);  
        }
        const course = await Course.create({
            title, description, category, createdBy,
            thumbnail:{
                public_id:thumbnail.public_id,
                secure_url:thumbnail.url
            },
        });
        if (!course) {
            return next(new ApiError("Course could not be created , please try again ",500));  
        }
        return res.status(200)
        .json({
            success:true,
            message:"Coures created successfully",
            course
        });
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
const updateCourseById = async(req, res, next) =>{
    try {
        const {id} = req.params;
        const course = await Course.findByIdAndUpdate(
            id, 
            {$set:req.body},
            {runValidators:true},
        );
        if (!course) {
             return next(new ApiError("Course with given id does not exist",500));
        }
        return res.status(200)
        .json({
            success:true,
            message:"Course successfully updated " ,
            course,
        })
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
const removeCourse = async(req, res, next) =>{
    try {
        const{id} = req.params;
        const course = await Course.findByIdAndDelete(id);
          
        
        return res.status(200)
        .json({
            success:true,
            message:"Course deleted successfully ",
            course,
        })
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
const addLectureToCourseById = async(req, res, next) =>{
    try {
        const {title, description} = req.body;
                       
        const {id} =req.params;
               
        const {path} = req.file;
             
          if(!title || !description ||!id){
            return next(new ApiError("All fields are required",400));  
        }
        const lectureData ={
            title,
            description,
            lecture:{},
        };

        const course = await Course.findById(id);
        if (!course) {
             return next(new ApiError("Course with given id does not exist",500));
        }  if (!path) {
             return next(new ApiError("Thumbnail is meassing",400));
        }
        const lecture = await uploadOnCloudinary(path);
               
        if(!lecture?.url){
            return next("Error while uploading  thumbnail on cloudinary ",400);  
        }
      lectureData.lecture.public_id = lecture.public_id;
      lectureData.lecture.secure_url = lecture.url;
      course.lectures.push(lectureData);

      course.numbersOfLectures = course.lectures.length;
      await course.save({validateBeforeSave:false});
      return res.status(200)
      .json({
        success:true,
        message:"Lecture successfully added to the coures",
        course
      })
    } catch (error) {
    console.log("Server add lectre ",error);
    
        return next(new ApiError(error.message,500)); 
    }
}


const removeLectureFromCourse = async (req, res, next) => {
  // Grabbing the courseId and lectureId from req.query
  const { courseId, lectureId } = req.query;
  // Checking if both courseId and lectureId are present
  if (!courseId) {
    return next(new ApiError('Course ID is required', 400));
  }

  if (!lectureId) {
    return next(new ApiError('Lecture ID is required', 400));
  }

  // Find the course uding the courseId
  const course = await Course.findById(courseId);

  // If no course send custom message
  if (!course) {
    return next(new ApiError('Invalid ID or Course does not exist.', 404));
  }

  // Find the index of the lecture using the lectureId
  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  // If returned index is -1 then send error as mentioned below
  if (lectureIndex === -1) {
    return next(new ApiError('Lecture does not exist.', 404));
  }

//   // Delete the lecture from cloudinary
  const result=await cloudinary.v2.uploader.destroy(
    course.lectures[lectureIndex].lecture.public_id,
    {
          resource_type: 'video',
        }
    );  
    
  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  course.numbersOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  // Return response
  res.status(200).json({
    success: true,
    message: 'Course lecture removed successfully',
  });
};

export {
    getAllCoures,
    getLecturesByCourseId,
    createCourse,
    updateCourseById,
    removeCourse,
    addLectureToCourseById,
    removeLectureFromCourse
}
