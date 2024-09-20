import { useState } from 'react';
import i18n from '../../translations/i18n';

export function SelectOption(title, type, option, handleChange) {
  const [selectedValue, setSelectedValue] = useState(Object.keys(option)[0] || '');

  const handleSelectChange = (e) => {
    setSelectedValue(e.target.value);
    handleChange(type, e.target.value);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        paddingLeft: 22,
        paddingRight: 22,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          fontFamily: 'Lato',
          fontWeight: 400,
          color: 'black',
          display: 'flex',
          paddingRight: 32,
          fontSize: 22,
          justifyContent: 'center',
        }}
      >
        {title}
      </div>
      <select
        className="selectScribeTheme"
        style={{ borderRadius: 5 }}
        id="payment"
        name="payment"
        value={selectedValue}
        onChange={handleSelectChange}
      >
        <option value="" disabled selected hidden>
          Please Choose...
        </option>

        {Object.keys(option).map((o) => (
          <option
            key={o}
            id={o}
            value={o}
            style={{
              backgroundColor: '#FFFFFF',
            }}
          >
            {option[o].label[i18n.language]
              ? option[o].label[i18n.language]
              : option[o].label.en}
          </option>
        ))}
      </select>
    </div>
  );
}
