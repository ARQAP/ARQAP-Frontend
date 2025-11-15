import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import Button from "@/components/ui/Button";
import Navbar from "@/app/(tabs)/Navbar";
import { useLoans, useUpdateLoan } from "@/hooks/useLoan";
import { LoanCard, GenericList } from "@/components/ui";
import { Loan } from "@/repositories/loanRepository";
import Colors from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function ViewLoan() {
  const router = useRouter();
  const { data: loans = [], isLoading, error, refetch, isFetching } = useLoans();
  const updateLoanMutation = useUpdateLoan();
  
  // Estados para controlar la expansión de las secciones
  const [isActiveSectionExpanded, setIsActiveSectionExpanded] = useState(true);
  const [isFinishedSectionExpanded, setIsFinishedSectionExpanded] = useState(false);

  const handleViewDetails = (loan: Loan) => {
    router.push(`/(tabs)/loan/Detail_loan?id=${loan.id}`);
  };

  const handleFinalizeLoan = async (id: number) => {
    try {
      const loan = loans.find(l => l.id === id);
      if (!loan) return;

      const now = new Date();
      
      // Crear fecha y hora local en formato ISO pero sin conversión UTC
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Crear datetime con zona horaria local
      const timezoneOffset = -now.getTimezoneOffset(); // Offset en minutos
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
      
      const returnDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezoneString}`;
      
      // Enviamos los datos con datetime completo con zona horaria
      const updateData = {
        ...loan,
        returnDate: returnDateTime,  // Datetime completo con zona horaria
        returnTime: returnDateTime,  // Datetime completo con zona horaria
      };

      await updateLoanMutation.mutateAsync({ id, payload: updateData });
      Alert.alert("Éxito", "Préstamo finalizado correctamente.");
    } catch (error) {
      const errorMessage = (error as Error).message || "Error al finalizar el préstamo";
      Alert.alert("Error", errorMessage);
      console.log("Error details:", error);
    }
  };

  console.log("Loans data:", loans);

  // Separar préstamos según tengan returnTime o no
  const activeLoans = loans.filter(loan => !loan.returnTime);
  const finishedLoans = loans.filter(loan => loan.returnTime);

  const renderLoanCard = (loan: Loan) => (
    <LoanCard
      loan={loan}
      onViewDetails={handleViewDetails}
      onFinalize={handleFinalizeLoan}
    />
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar title="Préstamos" showBackArrow backToHome />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.brown} />
          <Text style={{ marginTop: 10, color: Colors.brown }}>
            Cargando préstamos...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
        <Navbar title="Préstamos" showBackArrow backToHome />
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <Text style={{ color: "#DC2626", textAlign: "center", fontSize: 16 }}>
            Error al cargar los préstamos: {(error as Error).message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F3E9DD" }}>
      <Navbar title="Préstamos" showBackArrow backToHome />
      
      {/* Contenedor responsive - diferentes layouts para web y móvil */}
      {Platform.OS === 'web' ? (
        // Layout para web
        <View style={{ 
          flex: 1,
          paddingHorizontal: 20,
        }}>
          <View style={{ 
            width: '100%', 
            maxWidth: 900,
            alignSelf: 'center',
          }}>
            {/* Botón para crear nuevo préstamo */}
            <View style={{ paddingVertical: 20 }}>
              <Button
                title="Registrar Préstamo"
                onPress={() => router.push("/(tabs)/loan/New_loan")}
                style={{ backgroundColor: "#6B705C" }}
              />
            </View>

            {/* Estadísticas */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-around", backgroundColor: "#F7F5F2", borderRadius: 12, padding: 15 }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.brown }}>
                    {activeLoans.length}
                  </Text>
                  <Text style={{ color: Colors.brown, fontSize: 12 }}>Activos</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.green }}>
                    {finishedLoans.length}
                  </Text>
                  <Text style={{ color: Colors.green, fontSize: 12 }}>Finalizados</Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.black }}>
                    {loans.length}
                  </Text>
                  <Text style={{ color: Colors.black, fontSize: 12 }}>Total</Text>
                </View>
              </View>
            </View>

            {/* Listas separadas de préstamos */}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Préstamos Activos */}
              <View style={{ marginBottom: 30 }}>
                <TouchableOpacity 
                  style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    backgroundColor: "#F7F5F2",
                    padding: 15,
                    borderRadius: 12,
                    marginBottom: 15 
                  }}
                  onPress={() => setIsActiveSectionExpanded(!isActiveSectionExpanded)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: Colors.brown, 
                      marginRight: 8 
                    }} />
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: "bold", 
                      color: Colors.brown 
                    }}>
                      Préstamos Activos ({activeLoans.length})
                    </Text>
                  </View>
                  <MaterialIcons 
                    name={isActiveSectionExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color={Colors.brown} 
                  />
                </TouchableOpacity>
                
                {isActiveSectionExpanded && (
                  activeLoans.length > 0 ? (
                    activeLoans.map((loan) => (
                      <View key={loan.id} style={{ marginBottom: 10 }}>
                        {renderLoanCard(loan)}
                      </View>
                    ))
                  ) : (
                    <View style={{
                      backgroundColor: "#F7F5F2",
                      padding: 20,
                      borderRadius: 12,
                      alignItems: "center"
                    }}>
                      <Text style={{ color: Colors.brown, fontSize: 14 }}>
                        No hay préstamos activos
                      </Text>
                    </View>
                  )
                )}
              </View>

              {/* Préstamos Finalizados */}
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity 
                  style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    backgroundColor: "#F7F5F2",
                    padding: 15,
                    borderRadius: 12,
                    marginBottom: 15 
                  }}
                  onPress={() => setIsFinishedSectionExpanded(!isFinishedSectionExpanded)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: Colors.green, 
                      marginRight: 8 
                    }} />
                    <Text style={{ 
                      fontSize: 18, 
                      fontWeight: "bold", 
                      color: Colors.green 
                    }}>
                      Préstamos Finalizados ({finishedLoans.length})
                    </Text>
                  </View>
                  <MaterialIcons 
                    name={isFinishedSectionExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color={Colors.green} 
                  />
                </TouchableOpacity>
                
                {isFinishedSectionExpanded && (
                  finishedLoans.length > 0 ? (
                    finishedLoans.map((loan) => (
                      <View key={loan.id} style={{ marginBottom: 10 }}>
                        {renderLoanCard(loan)}
                      </View>
                    ))
                  ) : (
                    <View style={{
                      backgroundColor: "#F7F5F2",
                      padding: 20,
                      borderRadius: 12,
                      alignItems: "center"
                    }}>
                      <Text style={{ color: Colors.green, fontSize: 14 }}>
                        No hay préstamos finalizados
                      </Text>
                    </View>
                  )
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      ) : (
        // Layout para móvil - estructura muy simple
        <View style={{ flex: 1, padding: 20 }}>
          {/* Botón para crear nuevo préstamo */}
          <View style={{ marginBottom: 20 }}>
            <Button
              title="Registrar Préstamo"
              onPress={() => router.push("/(tabs)/loan/New_loan")}
              style={{ backgroundColor: "#6B705C" }}
            />
          </View>

          {/* Estadísticas */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-around", backgroundColor: "#F7F5F2", borderRadius: 12, padding: 15 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.brown }}>
                  {activeLoans.length}
                </Text>
                <Text style={{ color: Colors.brown, fontSize: 12 }}>Activos</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.green }}>
                  {finishedLoans.length}
                </Text>
                <Text style={{ color: Colors.green, fontSize: 12 }}>Finalizados</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: Colors.black }}>
                  {loans.length}
                </Text>
                <Text style={{ color: Colors.black, fontSize: 12 }}>Total</Text>
              </View>
            </View>
          </View>

          {/* Préstamos Activos */}
          <View style={{ marginBottom: 30 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "space-between",
                backgroundColor: "#F7F5F2",
                padding: 15,
                borderRadius: 12,
                marginBottom: 15 
              }}
              onPress={() => setIsActiveSectionExpanded(!isActiveSectionExpanded)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: Colors.brown, 
                  marginRight: 8 
                }} />
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: "bold", 
                  color: Colors.brown 
                }}>
                  Préstamos Activos ({activeLoans.length})
                </Text>
              </View>
              <MaterialIcons 
                name={isActiveSectionExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color={Colors.brown} 
              />
            </TouchableOpacity>
            
            {isActiveSectionExpanded && (
              activeLoans.length > 0 ? (
                activeLoans.map((loan) => (
                  <View key={loan.id} style={{ marginBottom: 10 }}>
                    {renderLoanCard(loan)}
                  </View>
                ))
              ) : (
                <View style={{
                  backgroundColor: "#F7F5F2",
                  padding: 20,
                  borderRadius: 12,
                  alignItems: "center"
                }}>
                  <Text style={{ color: Colors.brown, fontSize: 14 }}>
                    No hay préstamos activos
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Préstamos Finalizados */}
          <View style={{ marginBottom: 20 }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "space-between",
                backgroundColor: "#F7F5F2",
                padding: 15,
                borderRadius: 12,
                marginBottom: 15 
              }}
              onPress={() => setIsFinishedSectionExpanded(!isFinishedSectionExpanded)}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: 4, 
                  backgroundColor: Colors.green, 
                  marginRight: 8 
                }} />
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: "bold", 
                  color: Colors.green 
                }}>
                  Préstamos Finalizados ({finishedLoans.length})
                </Text>
              </View>
              <MaterialIcons 
                name={isFinishedSectionExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color={Colors.green} 
              />
            </TouchableOpacity>
            
            {isFinishedSectionExpanded && (
              finishedLoans.length > 0 ? (
                finishedLoans.map((loan) => (
                  <View key={loan.id} style={{ marginBottom: 10 }}>
                    {renderLoanCard(loan)}
                  </View>
                ))
              ) : (
                <View style={{
                  backgroundColor: "#F7F5F2",
                  padding: 20,
                  borderRadius: 12,
                  alignItems: "center"
                }}>
                  <Text style={{ color: Colors.green, fontSize: 14 }}>
                    No hay préstamos finalizados
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      )}
    </View>
  );
}
