import { View } from "react-native"
import DepositMap from "../../../components/DepositMap"
import Navbar from "../Navbar"

const Colors = {
  cream: "#F3E9DD",
}

export default function Deposit() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Navbar title="Mapa del depósito" backToHome />
      <View style={{ flex: 1 }}>
        <DepositMap />
      </View>
    </View>
  )
}
