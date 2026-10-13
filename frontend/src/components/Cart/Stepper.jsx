import CheckIcon from '@mui/icons-material/Check';
import { Link } from 'react-router-dom';

const steps = ['Address', 'Confirm details', 'Payment'];

const Stepper = ({ activeStep, children, items = [] }) => {
    return (
        <div className="flex flex-col gap-3">
            <nav aria-label="Checkout progress" className="rounded-xl border border-gray-100 bg-white px-3 py-4 shadow-sm sm:px-5">
                <ol className="flex items-start">
                    {steps.map((label, index) => {
                        const step = index + 1;
                        const completed = step < activeStep;
                        const active = step === activeStep;
                        const destination = step === 1 ? '/shipping' : step === 2 ? '/order/confirm' : '/process/payment';
                        const stepContent = (
                            <>
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                                    completed || active
                                        ? 'border-primary-blue bg-primary-blue text-white'
                                        : 'border-gray-300 bg-white text-gray-500'
                                }`}>
                                    {completed ? <CheckIcon sx={{ fontSize: 16 }} /> : step}
                                </span>
                                <span className={`mt-1.5 text-center text-[10px] leading-tight sm:text-xs ${
                                    active ? 'font-semibold text-primary-blue' : completed ? 'font-medium text-gray-700' : 'text-gray-500'
                                }`}>{label}</span>
                            </>
                        );

                        return (
                            <li key={label} className="relative flex min-w-0 flex-1 flex-col items-center">
                                {index < steps.length - 1 && (
                                    <span aria-hidden="true" className={`absolute left-1/2 top-3.5 h-0.5 w-full ${
                                        step < activeStep ? 'bg-primary-blue' : 'bg-gray-200'
                                    }`} />
                                )}
                                {completed ? (
                                    <Link
                                        to={destination}
                                        state={{ checkoutItems: items }}
                                        aria-label={`Completed step: ${label}`}
                                        className="relative z-10 flex flex-col items-center"
                                    >
                                        {stepContent}
                                    </Link>
                                ) : (
                                    <div aria-current={active ? 'step' : undefined} className="relative z-10 flex flex-col items-center">
                                        {stepContent}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
            <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 sm:px-5">
                    <h2 className="text-sm font-semibold text-gray-800 sm:text-base">{steps[activeStep - 1]}</h2>
                </div>
                {children}
            </section>
        </div>
    );
};

export default Stepper;
