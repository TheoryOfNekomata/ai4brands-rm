import { GetServerSideProps, NextPage } from "next";

const OwnerIndexPage: NextPage = () => null;

export default OwnerIndexPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: "/owner/edit/items",
      permanent: false,
    },
  }
};
