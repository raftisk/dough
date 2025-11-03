import { theme } from '../styles/theme';
import NavigationBar from '../components/NavigationBar';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const Wishlist = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.pageAlt,
      }}
    >
      <NavigationBar />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing[6],
        }}
      >
        <PageHeader
          title="Wishlist"
          subtitle="Track items or goals you want to save up for"
        />

        <EmptyState message="No wishlist items yet" />
      </div>
    </div>
  );
};

export default Wishlist;
