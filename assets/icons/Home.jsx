import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { theme } from "../../constants/theme";

const Home = (props) => {
  return (
    <Ionicons
      name="home-outline"
      size={26}
      color={theme.colors.rose}
      strokeWidht={1.6}
    />
  );
};

export default Home;
