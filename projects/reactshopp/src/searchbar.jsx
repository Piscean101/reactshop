import { useState } from "react";
import './index.css';

function Searchbar() {
    const [search, setSearch] = useState();
    return (
        <>
        <div id="userbar">
            <form>
            <input id="searchbar" type="text" placeholder="search" onChange={(e) => {search(e)}}></input>
            </form>
        </div>
        </>
    )
}

export default Searchbar;