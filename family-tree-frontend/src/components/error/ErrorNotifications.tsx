import { useError } from '../../contexts/ErrorContext';
import { ErrorToast } from './ErrorDisplay';
import './ErrorNotifications.css';

export function ErrorNotifications() {
  const { state, removeError } = useError();

  return (
    <div className="error-notifications">
      {state.errors.map(error => (
        <ErrorToast
          key={error.id}
          title={error.title}
          message={error.message}
          type={error.type}
          details={error.details}
          duration={error.duration}
          onDismiss={error.dismissible ? () => removeError(error.id) : undefined}
          onExpire={() => removeError(error.id)}
        />
      ))}
    </div>
  );
}