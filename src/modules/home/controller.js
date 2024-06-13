const HOME = (req,res,next) => {
    try {
        res.render("index")
    } catch (error) {
        console.log(error)
    }
}

export default {
    HOME
}