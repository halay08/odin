import { Button, Steps } from 'antd';
import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import {
  changeStepNumber,
  IStepViewChangeStepNumber,
  IStepViewValidation,
  setStepValidationArray,
} from './store/actions';

const { Step } = Steps;

interface Props {
  steps: { name: string, content: ReactElement, entityName?: string }[],
  stepViewReducer: any
  onSubmit: any,
  previousDisabled?: boolean,
  onNextActionClick?: any,
  isLookupCreate?: boolean,
  setValidationData: (params: IStepViewValidation[]) => void,
  changeStep: (params: IStepViewChangeStepNumber) => void,
  onPrevActionClick?: any
}

interface State {
  submitLoading: boolean,
  isNextLoading: boolean
}

class StepView extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.setInitailStepData(this.props.steps.length)
  }

  setInitailStepData = (n: number) => {

    const { setValidationData, changeStep } = this.props;
    let tempArr: any = [];

    for(let i = 1; i <= n; i++) {
      if(i === 1) {
        tempArr.push({ isNextDisabled: true, isPreviousDisabled: true });
      } else {
        tempArr.push({ isNextDisabled: false, isPreviousDisabled: true });
      }
      if(i === n) {
        setValidationData(tempArr);
        changeStep({ stepNumber: 0 });
      }
    }
  }

  state = {
    submitLoading: false,
    isNextLoading: false,
  };

  next = () => {
    const { onNextActionClick, isLookupCreate, stepViewReducer, steps, changeStep } = this.props;
    if(isLookupCreate) {
      this.setState({
        isNextLoading: true,
      });
      onNextActionClick(
        { step: stepViewReducer.currentStep, entityName: steps[stepViewReducer.currentStep].entityName },
        (result: any) => {
          if(result) {

            // move to the next step
            const currentStep = stepViewReducer.currentStep;
            changeStep({ stepNumber: currentStep + 1 });

          }

          this.setState({
            isNextLoading: false,
          });
        },
      )
    } else {

      const currentStep = stepViewReducer.currentStep;
      changeStep({ stepNumber: currentStep + 1 });

    }
  };

  prev = () => {
    const { onPrevActionClick, isLookupCreate, stepViewReducer, steps, changeStep } = this.props;
    if(isLookupCreate) {
      onPrevActionClick(
        { step: stepViewReducer.currentStep, entityName: steps[stepViewReducer.currentStep].entityName },
        (result: any) => {
          if(result) {

            // move to the next step
            const currentStep = stepViewReducer.currentStep;
            changeStep({ stepNumber: currentStep - 1 });

          }

        },
      )
    } else {

      const currentStep = stepViewReducer.currentStep;
      changeStep({ stepNumber: currentStep - 1 });

    }

  };

  submitClick() {
    const { onSubmit, stepViewReducer, setValidationData, changeStep } = this.props;
    this.setState({
      submitLoading: true,
    })
    onSubmit((cb: any) => {
      if(cb) {
        this.setState({
          submitLoading: false,
        })
        const tempArr = stepViewReducer.stepComponentsData;
        setValidationData(tempArr);
        changeStep({ stepNumber: 1 })
      } else {
        this.setState({
          submitLoading: false,
        })
      }
    });
  }

  render() {
    const { steps, stepViewReducer, previousDisabled, isLookupCreate } = this.props;
    return (
      <>
        <Steps
          type="navigation"
          size="small"
          current={stepViewReducer.currentStep}
          className="site-navigation-steps"
        >
          {
            steps.map((step: any) => (
              <Step key={step.name} title={step.name}/>
            ))
          }
        </Steps>
        <div className="steps-content">{steps[stepViewReducer.currentStep]?.content}</div>
        <div className="steps-action">
          {stepViewReducer.currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} 
            onClick={() => this.prev()}
            disabled={stepViewReducer.stepComponentsData[stepViewReducer.currentStep]?.isPreviousDisabled || previousDisabled}>
              Previous
            </Button>
          )}
          {stepViewReducer.currentStep < steps.length - 1 && (
            <Button type="primary" onClick={() => this.next()}
                    disabled={stepViewReducer.stepComponentsData[stepViewReducer.currentStep]?.isNextDisabled}
                    loading={this.state.isNextLoading}>
              Next
            </Button>
          )}
          {stepViewReducer.currentStep === steps.length - 1 && (
            <div style={{ display: 'flex' }}>
              <Button
                style={{ marginRight: 10 }}
                type="primary"
                ghost
                onClick={() => {
                  this.setState({ submitLoading: false })
                }}
                disabled={!this.state.submitLoading}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                onClick={() => {
                  this.submitClick()
                }}
                disabled={stepViewReducer.stepComponentsData[stepViewReducer.currentStep]?.isNextDisabled && isLookupCreate}
                loading={this.state.submitLoading}>
                Submit
              </Button>
            </div>
          )}
        </div>
      </>
    )
  }
}

const mapState = (state: any) => ({
  stepViewReducer: state.stepViewReducer,
});

const mapDispatch = (dispatch: any) => ({
  setValidationData: (params: IStepViewValidation[]) => dispatch(setStepValidationArray(params)),
  changeStep: (params: IStepViewChangeStepNumber) => dispatch(changeStepNumber(params)),
});

export default connect(mapState, mapDispatch)(StepView);
