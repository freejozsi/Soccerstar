/** @type {const} */
const themeColors = {
  primary:    { light: '#00E676', dark: '#00E676' }, // neon green — trajectory, active
  background: { light: '#0D1117', dark: '#0D1117' }, // deep dark field
  surface:    { light: '#161B22', dark: '#161B22' }, // card/panel surfaces
  foreground: { light: '#E6EDF3', dark: '#E6EDF3' }, // primary text
  muted:      { light: '#7D8590', dark: '#7D8590' }, // secondary text
  border:     { light: '#30363D', dark: '#30363D' }, // borders/dividers
  success:    { light: '#3FB950', dark: '#3FB950' }, // detection success
  warning:    { light: '#F78166', dark: '#F78166' }, // ball/accent
  error:      { light: '#F85149', dark: '#F85149' }, // detection error
  tint:       { light: '#00E676', dark: '#00E676' }, // tab active tint
  disc:       { light: '#58A6FF', dark: '#58A6FF' }, // disc/puck highlight
  goal:       { light: '#FFD700', dark: '#FFD700' }, // goal post highlight
};

module.exports = { themeColors };
