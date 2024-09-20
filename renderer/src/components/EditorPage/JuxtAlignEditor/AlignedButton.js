import CheckLogoWrong from '../../../../../public/icons/sundesmos/check_circleWrong.svg';
import CheckLogoTrue from '../../../../../public/icons/sundesmos/check_circleTrue.svg';

export function AlignedButton({ onClick, isCurrentSentenceAlign }) {
  return (
    <div className="wrapperButtonAlign" onClick={() => onClick()}>
      <div className="layoutButtonAlign">
        {isCurrentSentenceAlign ? (
          <CheckLogoTrue
            width="32"
            height="32"
            style={{ backgroundColor: '#CCC', borderRadius: 40 }}
          />
        ) : (
          <CheckLogoWrong
            width="32"
            height="32"
            style={{ backgroundColor: '#CCC', borderRadius: 40 }}
          />
        )}
        <div className="staticText">Aligned</div>
      </div>
    </div>
  );
}
