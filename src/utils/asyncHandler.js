const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
};

export default asyncHandler;







//ye function try catch k saath hai lakin ham promises wala use karen gay jo k uper hai 
//aik function dusray function ko as a parameter ja raha hai 
// const asyncHandler = (fn) => async() => {
//     try {
//         await fn(req, res, next);
//     }catch(error){
//     res.status(err.code || 500).json({
//         success: false,
//         message: err.message
//     })
//     }
// };
