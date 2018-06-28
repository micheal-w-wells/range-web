import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { Icon, Dropdown } from 'semantic-ui-react';
import { TextField } from '../../common';

import {
  ALLOWABLE_AUMS, PRIVATE_LAND_DEDUCTION, GRACE_DAYS,
  PASTURE_NOTES, NOT_PROVIDED,
} from '../../../constants/strings';
import { getObjValues } from '../../../utils';

const propTypes = {
  pasturesMap: PropTypes.shape({}).isRequired,
  className: PropTypes.string.isRequired,
};

class RupPastures extends Component {
  renderPastures = (pasture) => {
    const options = [
      {
        key: 'edit',
        text: 'Edit',
        icon: 'edit',
        onClick: () => console.log('edit'),
      },
      {
        key: 'delete',
        text: 'Delete',
        icon: 'delete',
        onClick: () => console.log('delete'),
      },
    ];
    const {
      id,
      name,
      allowableAum,
      pldPercent,
      graceDays,
      notes,
    } = pasture || {};
    const pld = pldPercent && Math.floor(pldPercent * 100);

    return (
      <div className="rup__pasture" key={id}>
        <div className="rup__pasture__header">
          <div>
            Pasture: {name}
          </div>
          {/* <Dropdown
            trigger={<Icon name="ellipsis vertical" />}
            options={options}
            icon={null}
            pointing="top right"
          /> */}
        </div>
        <div className="rup__row">
          <div className="rup__cell-4">
            <TextField
              label={ALLOWABLE_AUMS}
              text={allowableAum}
            />
          </div>
          <div className="rup__cell-4">
            <TextField
              label={PRIVATE_LAND_DEDUCTION}
              text={pld}
            />
          </div>
          <div className="rup__cell-4">
            <TextField
              label={GRACE_DAYS}
              text={graceDays}
            />
          </div>
        </div>
        <TextField
          label={PASTURE_NOTES}
          text={notes}
        />
      </div>
    );
  }

  render() {
    const { pasturesMap, className } = this.props;
    const pastures = getObjValues(pasturesMap) || [];

    return (
      <div className={className}>
        <div className="rup__title">Pastures</div>
        <div className="rup__divider" />
        {
          pastures.length === 0 ? (
            <div className="rup__section-not-found">{NOT_PROVIDED}</div>
          ) : (
            pastures.map(this.renderPastures)
          )
        }
      </div>
    );
  }
}

RupPastures.propTypes = propTypes;
export default RupPastures;
