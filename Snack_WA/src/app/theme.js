export const theme = {
  token: {
    colorPrimary: '#f97316',
    colorInfo: '#f97316',
    colorSuccess: '#16a34a',
    colorWarning: '#f59e0b',
    colorError: '#dc2626',
    colorTextBase: '#292524',
    colorBgBase: '#ffffff',
    colorBgLayout: '#fffaf5',
    colorBorder: '#fed7aa',
    colorBorderSecondary: '#ffedd5',
    borderRadius: 12,
    fontFamily: "'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    controlHeight: 38,
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      fontWeight: 600,
      primaryShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
    },
    Card: {
      borderRadiusLG: 16,
      colorBorderSecondary: '#fed7aa60',
      boxShadowTertiary: '0 8px 24px rgba(124, 45, 18, 0.05)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#fff7ed',
      headerColor: '#9a3412',
      rowHoverBg: '#fffaf5',
    },
    Menu: {
      itemBorderRadius: 8,
      itemSelectedColor: '#ea580c',
      itemSelectedBg: '#ffedd5',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Modal: {
      borderRadiusLG: 16,
    },
  },
};
