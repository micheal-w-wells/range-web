import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  handleNullValue,
  getRangeReadinessMonthAndDate
} from '../../../../utils'
import IndicatorPlantsForm from '../IndicatorPlantsForm'
import { plantCommunityUpdated } from '../../../../actions'
import { PLANT_CRITERIA } from '../../../../constants/variables'

const RangeReadinessBox = ({ plantCommunity, namespace }) => {
  const {
    rangeReadinessDay: day,
    rangeReadinessMonth: month,
    rangeReadinessNote
  } = plantCommunity

  const readinessMonthAndDate = getRangeReadinessMonthAndDate(month, day)

  return (
    <div className="rup__plant-community__sh">
      <div className="rup__plant-community__rr__title">
        {/* <img src={IMAGE_SRC.INFO_ICON} alt="info icon" /> */}
        Range Readiness
      </div>
      <div>
        If more than one readiness criteria is provided, all such criteria must
        be met before grazing may occur.
      </div>

      <div className="rup__plant-community__rr__label">Readiness Date</div>
      <div>{handleNullValue(readinessMonthAndDate)}</div>

      <IndicatorPlantsForm
        indicatorPlants={plantCommunity.indicatorPlants.filter(
          ip => ip.criteria === PLANT_CRITERIA.RANGE_READINESS
        )}
        namespace={namespace}
        valueLabel="Criteria (Leaf Stage)"
        criteria={PLANT_CRITERIA.RANGE_READINESS}
      />

      <div className="rup__plant-community__rr__label">Notes</div>
      <div>{handleNullValue(rangeReadinessNote)}</div>
    </div>
  )
}

RangeReadinessBox.propTypes = {
  plantCommunity: PropTypes.shape({
    indicatorPlants: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        plantSpeciesId: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired
      })
    )
  }),
  namespace: PropTypes.string.isRequired
}

const mapDispatchToProps = {
  plantCommunityUpdated
}

export default connect(
  null,
  mapDispatchToProps
)(RangeReadinessBox)
