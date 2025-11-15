import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/constants/Colors';

export interface GenericListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  title?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  emptyStateMessage?: string;
  error?: string | null;
  customStyles?: {
    container?: object;
    title?: object;
    emptyState?: object;
    errorState?: object;
  };
}

function GenericList<T>({
  data,
  renderItem,
  keyExtractor,
  title,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  emptyStateMessage = 'No hay elementos para mostrar',
  error,
  customStyles = {},
}: GenericListProps<T>) {
  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, styles.centerContainer, customStyles.container]}>
        <ActivityIndicator size="large" color={Colors.green} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContainer, customStyles.container]}>
        <Text style={[styles.errorText, customStyles.errorState]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, customStyles.emptyState]}>
        {emptyStateMessage}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, customStyles.container]}>
      {title && (
        <Text style={[styles.title, customStyles.title]}>{title}</Text>
      )}
      
      <FlatList
        data={data}
        renderItem={({ item }) => renderItem(item)}
        keyExtractor={keyExtractor}
        contentContainerStyle={data.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.green]}
              tintColor={Colors.green}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.green,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: Colors.brown,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.green,
  },
});

export default GenericList;