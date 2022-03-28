import React, { Component } from "react";
import AllRoutes from "./components/AllRoutes";
import SelectAccounts from "./components/SelectAccounts";
import moment from "moment";

require("moment");
require("moment-timezone");
moment.tz.setDefault("America/Chicago");

require("dotenv").config();

export default class App extends Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light navbar-fixed-top">
          {/*<a className="navbar-brand" href="#">*/}
          {/*  Navbar*/}
          {/*</a>*/}
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item active">
                {" "}
                <a className="nav-link" href="/">
                  Home<span className="sr-only">(current)</span>
                </a>{" "}
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/payments">
                  Payments
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/payment/required">
                  Payment Required
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/freeform">
                  FreeForm
                </a>
              </li>

              <li className="nav-item">
                <SelectAccounts />
              </li>
            </ul>
          </div>

          <ul className="nav navbar-nav navbar-right">
            <b>
              <li className="nav-item">
                <a href="/login">
                  <i className="fa fa-fw fa-user" />
                </a>
              </li>
              {/*<a href="/login" style={{color:"black"}}><i className="fa fa-fw fa-user" style={{color:"black"}}></i>Login</a>*/}
            </b>
          </ul>
        </nav>
        <AllRoutes />
      </div>
    );
  }
}
