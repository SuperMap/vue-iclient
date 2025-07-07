import type { TimerProps, ShortEmits, ThemeProps } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults, themeProps } from '@supermapgis/common/utils/index.common'

export interface HeaderStyleParams {
  show?: boolean;
  height?: number;
  background?: string;
  color?: string;
  sortBtnSelectColor?: string;
  sortBtnColor?: string;
}

export interface RowStyleParams {
  height: number;
  oddStyle?: {
    background?: string;
  };
  evenStyle?: {
    background?: string;
  };
}

export interface StyleRangeParams {
  min: number;
  max: number;
  color: string;
}

export interface CellStyleRangeGroupParams {
  type: 'background' | 'color';
  data: StyleRangeParams[];
}

export interface SlotParams {
  customRender: '';
}

export interface FixInfoParams {
  prefix: '';
  suffix: '';
}

export interface ColumnParams {
  header: string;
  field: string;
  width: number;
  sort: true | false | undefined;
  defaultSortType: 'ascend' | 'descend' | 'none';
  fixInfo: FixInfoParams;
  slots?: SlotParams;
}

export interface HighlightOption {
  dataIndex: number;
  properties: Object;
}


export const textListProps = () => ({
  content: {
    type: null
  },
  dataset: {
    type: null
  },
  header: {
    type: Array,
    default: () => []
  },
  rows: {
    type: Number,
    default: 6
  },
  autoRolling: {
    type: Boolean,
    default: false
  },
  fontSize: {
    type: [Number, String]
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  fields: {
    type: Array,
    default: () => []
  },
  columnWidths: {
    type: Array,
    default: () => []
  },
  rowStyle: {
    type: Object
  },
  headerStyle: {
    type: Object,
    default: () => ({ show: true })
  },
  thresholdsStyle: {
    type: Array
  },
  columns: {
    type: Array
  },
  highlightOptions: {
    type: Array,
    default: () => []
  },
  highlightCurrentRow: {
    type: Boolean,
    default: true
  },
  highlightColor: {
    type: [String, Function],
    default: '#b9b9b9'
  }
})

// export type TextListProps = Partial<ExtractPropTypes<ReturnType<typeof TextListProps>>>
export interface TextListProps extends ThemeProps, TimerProps {
  content?: any
  dataset?: any
  header?: string[]
  rows?: number
  autoRolling?: boolean
  fontSize?: number | string
  autoResize?: boolean
  fields?: string[]
  columnWidths?: number[]
  rowStyle?: RowStyleParams
  headerStyle?: HeaderStyleParams
  thresholdsStyle?: CellStyleRangeGroupParams[]
  columns?: ColumnParams[],
  highlightOptions?: HighlightOption[],
  highlightCurrentRow?: boolean,
  highlightColor?: string | Function
}

export const textListPropsDefault = getPropsDefaults<TextListProps>(
  Object.assign(themeProps(), textListProps())
)

export type TextListEvents = {
  contentChange: [Array<Object>],
  'row-click': [any, number, Event],
  'cell-click': [any, number, Event],
  'cell-mouse-enter': [any, number, Event],
  'cell-mouse-leave': [any, number, Event]
}

export type TextListEmits = ShortEmits<TextListEvents>
