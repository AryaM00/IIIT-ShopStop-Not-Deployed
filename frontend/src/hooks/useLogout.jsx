import { useAuthContext } from "./useAuthContext";
export const useLogout = () => {
    const {dispatch} = useAuthContext();
    const logout =()=>
    {

        dispatch({type: 'LOGOUT'});
        // remove user from local storage
        localStorage.removeItem('user');
    }
    return {logout};
}