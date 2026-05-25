import "./Home.scss";

import React from "react";

import { Container } from "@/covaltech-react-ui";

import Hero from "./Hero/Hero";

const Home: React.FC = () => {
  return (
    <Container className="home">
      <Hero />
    </Container>
  );
};

export default Home;
