import { useLocale } from './useLocale'

interface AddressMatchParameter {
  url: string
  name?: string
  proxy?: (url?: string) => string | number
}

interface GeoJSONParameter {
  type: 'geoJSON'
  maxFeatures?: number
  geoJSON?:
    | Array<GeoJSON.Feature<GeoJSON.Geometry>>
    | GeoJSON.Feature<GeoJSON.Geometry>
    | GeoJSON.FeatureCollection<GeoJSON.Geometry>
}

interface iServerBaseParameter {
  type: 'iServer'
  url: string
  attributeFilter?: string
  name?: string
  maxFeatures?: number
  proxy?: (url?: string) => string | string
  queryMode?: 'SQL' | 'KEYWORD'
}

interface iPortalDataParameter extends Omit<iServerBaseParameter, 'type' | 'proxy'> {
  type: 'iPortal'
  withCredentials: boolean
}

interface iServerDataParameter extends iServerBaseParameter {
  dataName: string[]
}

interface iServerMapParameter extends iServerBaseParameter {
  layerName: string
}

interface RestParameter extends Omit<iServerBaseParameter, 'type' | 'queryMode'> {
  type: 'rest'
}

export function useParameters() {
  const { t } = useLocale()

  function createAddressMatchParameter(
    options: Partial<AddressMatchParameter>
  ): AddressMatchParameter {
    return {
      url: options.url,
      proxy: options.proxy,
      name: options.name ?? t('commontypes.addressMatch')
    }
  }

  function createGeoJSONParameter(options: Partial<GeoJSONParameter>): GeoJSONParameter {
    return {
      type: 'geoJSON',
      maxFeatures: options.maxFeatures ?? 20,
      geoJSON: options.geoJSON
    }
  }

  function createiPortalDataParameter(
    options: Partial<iPortalDataParameter>
  ): iPortalDataParameter {
    return {
      type: 'iPortal',
      name: options.name ?? t('commontypes.iportalData'),
      url: options.url,
      attributeFilter: options.attributeFilter,
      withCredentials: options.withCredentials ?? false,
      maxFeatures: options.maxFeatures ?? 20,
      queryMode: options.queryMode ?? 'SQL'
    }
  }

  function createiServerDataParameter(
    options: Partial<iServerDataParameter>
  ): iServerDataParameter {
    return {
      type: 'iServer',
      name: options.name ?? t('commontypes.restData'),
      url: options.url,
      dataName: options.dataName,
      attributeFilter: options.attributeFilter,
      proxy: options.proxy,
      maxFeatures: options.maxFeatures ?? 20,
      queryMode: options.queryMode ?? 'SQL'
    }
  }

  function createiServerMapParameter(options: Partial<iServerMapParameter>): iServerMapParameter {
    return {
      type: 'iServer',
      name: options.name ?? t('commontypes.restMap'),
      url: options.url,
      layerName: options.layerName,
      attributeFilter: options.attributeFilter,
      proxy: options.proxy,
      maxFeatures: options.maxFeatures ?? 20,
      queryMode: options.queryMode ?? 'SQL'
    }
  }

  function createRestParameter(options: Partial<RestParameter>): RestParameter {
    return {
      type: 'rest',
      name: options.name ?? t('commontypes.restData'),
      url: options.url,
      attributeFilter: options.attributeFilter,
      proxy: options.proxy,
      maxFeatures: options.maxFeatures ?? 20
    }
  }

  return {
    createAddressMatchParameter,
    createGeoJSONParameter,
    createiPortalDataParameter,
    createiServerDataParameter,
    createiServerMapParameter,
    createRestDataParameter: createiServerDataParameter,
    createRestMapParameter: createiServerMapParameter,
    createRestParameter
  }
}
