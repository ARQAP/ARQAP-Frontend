"use client"

import { View, Text, TouchableOpacity, Platform, Alert } from "react-native"
import type { Archaeologist } from "../../../repositories/archaeologistRespository"
import { useState } from "react"

interface ArchaeologistCardProps {
  archaeologist: Archaeologist
  onEdit: (archaeologist: Archaeologist) => void
  onDelete: (id: number) => void
  onViewDetails?: (archaeologist: Archaeologist) => void
}

export function ArchaeologistCard({ archaeologist, onEdit, onDelete }: ArchaeologistCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleDelete = () => {
    setShowMenu(false)
    if (Platform.OS === "web") {
      if (window.confirm(`¿Estás seguro de eliminar a ${archaeologist.firstname} ${archaeologist.lastname}?`)) {
        onDelete(archaeologist.id!)
      }
    } else {
      Alert.alert(
        "Confirmar eliminación",
        `¿Estás seguro de eliminar a ${archaeologist.firstname} ${archaeologist.lastname}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", onPress: () => onDelete(archaeologist.id!), style: "destructive" },
        ],
      )
    }
  }

  const handleEdit = () => {
    setShowMenu(false)
    onEdit(archaeologist)
  }

  if (Platform.OS === "web") {
    return (
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 12,
          padding: 20,
          shadowColor: "#8B5E3C",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          position: "relative",
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}
        >
          <Text
            style={{
              fontFamily: "MateSC-Regular",
              fontSize: 17,
              color: "#8B5E3C",
              fontWeight: "600",
              flex: 1,
              lineHeight: 24,
            }}
          >
            {archaeologist.firstname} {archaeologist.lastname}
          </Text>

          <View style={{ position: "relative" }}>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={{ padding: 8 }}>
              <Text style={{ fontSize: 20, color: "#8B5E3C", fontWeight: "bold" }}>⋮</Text>
            </TouchableOpacity>

            {showMenu && (
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  top: 40,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                  minWidth: 140,
                  zIndex: 1000,
                  borderWidth: 1,
                  borderColor: "#E5D4C1",
                }}
              >
                <TouchableOpacity
                  onPress={handleEdit}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5D4C1",
                  }}
                >
                  <Text style={{ fontFamily: "CrimsonText-Regular", fontSize: 15, color: "#8B5E3C" }}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={{ padding: 12 }}>
                  <Text style={{ fontFamily: "CrimsonText-Regular", fontSize: 15, color: "#C84B31" }}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#F7F5F2",
            borderRadius: 8,
            padding: 12,
            marginTop: "auto",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#8B5E3C",
                marginRight: 8,
              }}
            />
            <Text
              style={{
                fontFamily: "CrimsonText-Regular",
                fontSize: 14,
                color: "#A0785D",
                fontWeight: "600",
              }}
            >
              Arqueólogo registrado
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View
      style={{
        backgroundColor: "#F7F5F2",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#E5D4C1",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: "MateSC-Regular", fontSize: 18, color: "#8B5E3C", fontWeight: "600", flex: 1 }}>
          {archaeologist.firstname} {archaeologist.lastname}
        </Text>

        <View style={{ position: "relative" }}>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 20, color: "#8B5E3C", fontWeight: "bold" }}>⋮</Text>
          </TouchableOpacity>

          {showMenu && (
            <View
              style={{
                position: "absolute",
                right: 0,
                top: 40,
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 5,
                minWidth: 150,
                zIndex: 1000,
              }}
            >
              <TouchableOpacity
                onPress={handleEdit}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E5D4C1",
                }}
              >
                <Text style={{ fontFamily: "CrimsonText-Regular", fontSize: 15, color: "#8B5E3C" }}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ padding: 12 }}>
                <Text style={{ fontFamily: "CrimsonText-Regular", fontSize: 15, color: "#C84B31" }}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
