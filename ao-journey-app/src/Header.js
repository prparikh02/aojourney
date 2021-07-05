import React from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  return (
    <nav>
      <NavLink exact activeClassName="active" to="/">
        Home
      </NavLink>
      <NavLink activeClassName="active" to="/home">
        Home2
      </NavLink>
    </nav>
  );
}

export default Header;
