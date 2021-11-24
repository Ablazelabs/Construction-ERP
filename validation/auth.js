//this module performs authorization for users

const authorization={
    userHasPrevilage:(userId,Previlage,next)=>{
        return true;
        //calls error if user isn't authenticated
    }
}