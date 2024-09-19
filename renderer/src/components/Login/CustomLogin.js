import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Typography } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import 'tailwindcss/tailwind.css';

const CustomLogin = ({
  ui, error, login, userlist, validation, buttonname,
}) => {
  const [values, setValue] = React.useState({});
  const handleChange = (prop) => (event) => {
    setValue({ ...values, [prop]: event.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    login(values);
    setValue({});
  };
  return (

    <form key="login" name="aglogin" onSubmit={(e) => handleSubmit(e)}>
      <Typography color="error">{validation?.msg}</Typography>
      {ui?.autocomplete?.count?.map((v) => (
        <div className="flex" key={v.label}>
          <div className="flex flex-col justify-end">
            <PersonOutlineIcon />
          </div>

          <Autocomplete
            freeSolo
            id="username"
            data-testid="autocomplete"
            className="text-xs h-12 appearance-none w-full py-2 pl-4"
            options={userlist}
            getOptionLabel={(option) => option.username || ''}
            onChange={handleChange(values)}
            getOptionSelected={(option, value) => option.username === value.username}
            onInputChange={(event, newInputValue) => {
              setValue({ ...values, username: newInputValue });
            }}
            renderInput={(params) => (
              <TextField className="outline-none" {...params} label={v.label} error={error.username} />
            )}
          />
        </div>
      ))}
      {ui?.textfield?.count?.map((c) => (
        <div key={c.name}>
          <div key={c.label}>
            <div className=" mb-2 text-base text-left text-gray-500">
              {c.label}
              *
            </div>
            <input
              data-testid="text-box"
              name={c.name}
              label={c.label}
              type={c.type}
              onChange={handleChange(c.label)}
              placeholder={c.label}
              className="text-xs
                mb-8
                focus:border-primary
                h-12 max-w-md
                appearance-none
                border-primary
                rounded
                w-full
                py-2
                px-3
                 text-gray-600
                 "
            />
          </div>
          <Typography color="error">{validation?.[c.name]}</Typography>
        </div>
      ))}
      <div className="text-xs mb-8 max-w-md appearance-none py-2 px-3">
        {ui?.viewForgot && (
          <a className="text-xs text-error float-right" href="/signup">
            Forgot Password?
          </a>
        )}
      </div>
      <input
        data-testid="login-button"
        type="submit"
        value={buttonname}
        className="text-xs
           focus:border-blue-600
           focus:ring
           max-w-md h-12 appearance-none
           cursor-pointer
           border rounded
           w-full py-2 px-3 text-white focus:outline-none bg-primary"
      />
    </form>

  );
};
export default CustomLogin;
CustomLogin.propTypes = {
  /** State which triggers login. */
  ui: PropTypes.object,
  error: PropTypes.object,
  login: PropTypes.func,
  userlist: PropTypes.array,
  validation: PropTypes.object,
  buttonname: PropTypes.string,
};
