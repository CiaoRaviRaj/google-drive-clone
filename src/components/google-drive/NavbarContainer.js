import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NavbarContainer() {
  return (
    <Navbar
      bg="light"
      expand="sm"
      className=""
      style={{ justifyContent: "space-between" }}>
      <Navbar.Brand as={Link} to="/">
        CIAO DRIVE
      </Navbar.Brand>
      <Nav>
        <Nav.Link as={Link} to="/user">
          Profile
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}
