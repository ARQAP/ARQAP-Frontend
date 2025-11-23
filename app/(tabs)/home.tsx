import { useAllArchaeologicalSites } from "@/hooks/useArchaeologicalsite";
import { useArchaeologists } from "@/hooks/useArchaeologist";
import { useArtefacts } from "@/hooks/useArtefact";
import { useCollections } from "@/hooks/useCollections";
import { useLoans } from "@/hooks/useLoan";
import { useLogoutMutation } from "@/hooks/useUserAuth";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Colors from "../../constants/Colors";
import Navbar from "./Navbar";

type ActionCardProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count: number;
  onPress: () => void;
};

const ActionCard = ({ title, description, icon, color, count, onPress }: ActionCardProps) => {
  const { width } = useWindowDimensions();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = width >= 1024;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      className="bg-[#fbf9f5] rounded-2xl border"
      style={[
        styles.cardShadow,
        {
          borderColor: isHovered && isDesktop ? color : "rgba(0,0,0,0.06)",
          borderWidth: isHovered && isDesktop ? 2 : 1,
          paddingHorizontal: isDesktop ? 32 : 16,
          paddingVertical: isDesktop ? 24 : 16,
          minHeight: isDesktop ? 150 : 110,
          justifyContent: "center",
          shadowRadius: isHovered && isDesktop ? 12 : 10,
          shadowOpacity: isHovered && isDesktop ? 0.15 : 0.08,
        },
        {
          transform: [
            { scale: isPressed ? 0.98 : isHovered && isDesktop ? 1.02 : 1 },
          ],
        },
        isHovered && isDesktop && { translateY: -2 },
        Platform.select({ web: isDesktop ? { cursor: "pointer" } : {} }),
      ]}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="rounded-xl items-center justify-center mr-5 shrink-0"
            style={[
              styles.iconShadow,
              {
                backgroundColor: color,
                width: isDesktop ? 72 : 52,
                height: isDesktop ? 72 : 52,
                borderRadius: 18,
                transform: [{ scale: isHovered && isDesktop ? 1.05 : 1 }],
              },
            ]}
          >
            <Ionicons name={icon} size={isDesktop ? 34 : 24} color="#fff" />
          </View>
          <View className="flex-1">
            <Text
              className="mb-1.5"
              style={[
                styles.titleText,
                {
                  color: isHovered && isDesktop ? color : Colors.black,
                  fontSize: isDesktop ? 27 : 21,
                  lineHeight: isDesktop ? 32 : 24,
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.descriptionText,
                {
                  color: Colors.black,
                  opacity: 0.7,
                  fontSize: isDesktop ? 22 : 16,
                  lineHeight: isDesktop ? 28 : 20,
                },
              ]}
              numberOfLines={2}
            >
              {description}
            </Text>
          </View>
        </View>

        <View
          className="items-center justify-center shrink-0 ml-4"
          style={{
            paddingRight: isDesktop ? 6 : 2,
          }}
        >
          <Text
            style={{
              color: Colors.green,
              fontSize: isDesktop ? 34 : 24,
              fontFamily: "MateSC-Regular",
              letterSpacing: 2,
              textAlign: "right",
              opacity: 0.9,
            }}
          >
            {count}
          </Text>
        </View>
      </View>

      {isHovered && isDesktop && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius: 16,
              backgroundColor: `${color}08`,
            },
          ]}
        />
      )}
    </Pressable>
  );
};

type QuickActionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

const QuickAction = ({ title, icon, onPress }: QuickActionProps) => {
  const { width } = useWindowDimensions();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = width >= 1024;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      className="rounded-2xl items-center justify-center"
      style={[
        {
          backgroundColor: isHovered && isDesktop ? "#c9b89a" : "#d4c4a8",
          paddingVertical: isDesktop ? 50 : 35,
          paddingHorizontal: isDesktop ? 30 : 20,
          flex: 1,
        },
        {
          transform: [
            { scale: isPressed ? 0.96 : isHovered && isDesktop ? 1.04 : 1 },
          ],
        },
        Platform.select({ web: isDesktop ? { cursor: "pointer" } : {} }),
      ]}
    >
      <View
        className="rounded-full items-center justify-center mb-3"
        style={{
          backgroundColor: Colors.brown,
          width: isDesktop ? 70 : 55,
          height: isDesktop ? 70 : 55,
        }}
      >
        <Ionicons name={icon} size={isDesktop ? 32 : 24} color="#fff" />
      </View>
      <Text
        style={[
          styles.quickActionText,
          {
            fontSize: isDesktop ? 16 : 12,
            color: Colors.black,
            textAlign: "center",
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  const logoutMutation = useLogoutMutation();
  const { data: artefacts = [] } = useArtefacts();
  const { data: collections = [] } = useCollections();
  const { data: sites = [] } = useAllArchaeologicalSites();
  const { data: archaeologists = [] } = useArchaeologists();
  const { data: loans = [] } = useLoans();

  const activeLoans = loans.filter(
    (loan) => !loan.returnDate || !loan.returnTime
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "MateSC-Regular": require("../../assets/fonts/MateSC-Regular.ttf"),
        "CrimsonText-Regular": require("../../assets/fonts/CrimsonText-Regular.ttf"),
        "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Colors.brown} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.cream }}>
      <Navbar title="Inicio" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: isDesktop ? 48 : 32,
        }}
      >
        <View
          className="w-full mx-auto"
          style={{
            maxWidth: isDesktop ? 1360 : 720,
            paddingHorizontal: isDesktop ? 35 : 16,
            paddingTop: isDesktop ? 35 : 20,
          }}
        >
          {/* Header */}
          <View
            style={{ marginBottom: isDesktop ? 36 : 24 }}
            className="items-center"
          >
            <Text
              style={[
                styles.headerTitle,
                {
                  color: Colors.black,
                  fontSize: isDesktop ? 60 : 32,
                  lineHeight: isDesktop ? 75 : 40,
                },
              ]}
            >
              ARQAP
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                {
                  marginTop: 8,
                  color: Colors.black,
                  opacity: 0.65,
                  fontSize: isDesktop ? 30 : 16,
                  textAlign: "center",
                },
              ]}
            >
              Museo De Ciencias Naturales
            </Text>
          </View>

          {/* Gestión Principal */}
          {isDesktop && (
            <Text
              style={[
                styles.sectionLabel,
                {
                  marginBottom: 16,
                  color: Colors.black,
                  opacity: 0.6,
                },
              ]}
            >
              Gestión Principal
            </Text>
          )}

          <View
            style={{
              rowGap: isDesktop ? 20 : 14,
              marginBottom: isDesktop ? 30 : 20,
            }}
          >
            {/* Primera fila */}
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                columnGap: isDesktop ? 20 : 0,
                rowGap: isDesktop ? 0 : 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Piezas Arqueológicas"
                  description="Registrar y gestionar las piezas"
                  icon="document-text-outline"
                  color={Colors.green}
                  count={artefacts.length}
                  onPress={() =>
                    router.push("/(tabs)/archaeological-Pieces")
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Colecciones Arqueológicas"
                  description="Organizar por colecciones"
                  icon="albums-outline"
                  color={Colors.green}
                  count={collections.length}
                  onPress={() =>
                    router.push("/(tabs)/collection/View_collection")
                  }
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                columnGap: isDesktop ? 20 : 0,
                rowGap: isDesktop ? 0 : 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Sitios Arqueológicos"
                  description="Gestionar ubicaciones"
                  icon="location-outline"
                  color={Colors.green}
                  count={sites.length}
                  onPress={() =>
                    router.push("/(tabs)/location/Location")
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionCard
                  title="Arqueólogos"
                  description="Gestionar especialistas"
                  icon="person-outline"
                  color={Colors.green}
                  count={archaeologists.length}
                  onPress={() =>
                    router.push("/(tabs)/archaeologist/View_archaeologist")
                  }
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <ActionCard
                title="Préstamos"
                description="Gestionar préstamos activos"
                icon="swap-horizontal-outline"
                color={Colors.green}
                count={activeLoans.length}
                onPress={() => router.push("/(tabs)/loan/View_loan")}
              />
            </View>
          </View>

          <View
            style={{
              marginTop: isDesktop ? 40 : 30,
              marginBottom: isDesktop ? 40 : 30,
            }}
          >
            {isDesktop && (
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    marginBottom: 16,
                    color: Colors.black,
                    opacity: 0.6,
                  },
                ]}
              >
                Acciones Rápidas
              </Text>
            )}

            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                columnGap: isDesktop ? 20 : 0,
                rowGap: isDesktop ? 0 : 12,
              }}
            >
              <QuickAction
                title="Nueva Pieza"
                icon="add-circle-outline"
                onPress={() =>
                  router.push("/(tabs)/archaeological-Pieces/New_piece")
                }
              />
              <QuickAction
                title="Nuevo Arqueólogo"
                icon="person-add-outline"
                onPress={() =>
                  router.push("/(tabs)/archaeologist/New_archaeologist")
                }
              />
              <QuickAction
                title="Nueva Colección"
                icon="add-circle-outline"
                onPress={() =>
                  router.push("/(tabs)/collection/New_collection")
                }
              />
            </View>
          </View>

          {/* Botón de Cerrar Sesión */}
          <View className="items-center mt-4 pb-8">
            <Pressable
              onPress={handleLogout}
              disabled={logoutMutation.isPending}
              className={`rounded-lg px-8 py-3 ${
                logoutMutation.isPending ? "bg-gray-400" : "bg-[#A3473B]"
              }`}
              style={[
                {
                  paddingHorizontal: isDesktop ? 32 : 24,
                  paddingVertical: isDesktop ? 12 : 10,
                },
                Platform.select({ web: { cursor: "pointer" } }),
              ]}
            >
              {logoutMutation.isPending ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text
                    className="text-white ml-2"
                    style={[
                      styles.buttonText,
                      {
                        fontSize: isDesktop ? 16 : 14,
                      },
                    ]}
                  >
                    Cerrando sesión...
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-white"
                  style={[
                    styles.buttonText,
                    {
                      fontSize: isDesktop ? 16 : 14,
                    },
                  ]}
                >
                  Cerrar Sesión
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 5,
  },
  iconShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontFamily: "MateSC-Regular",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "CrimsonText-Regular",
  },
  sectionLabel: {
    fontFamily: "CrimsonText-Regular",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  titleText: {
    fontFamily: "MateSC-Regular",
    letterSpacing: 0.3,
  },
  descriptionText: {
    fontFamily: "CrimsonText-Regular",
  },
  quickActionText: {
    fontFamily: "MateSC-Regular",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  buttonText: {
    fontFamily: "CrimsonText-Regular",
  },
});
